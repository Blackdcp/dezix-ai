import { db } from "@/lib/db";
import { waitUntil } from "@vercel/functions";
import { authenticateRequest, getModelWhitelist } from "./auth";
import { checkRateLimit } from "./rate-limiter";
import { estimateTokens, estimateTextTokens } from "./token-counter";
import { selectChannel } from "./router";
import { preCheckBalance, chargeUser } from "./billing";
import { createStreamTransformer, buildStreamUrl } from "./stream";
import { logUsage } from "./logger";
import { getAdapter } from "./adapters/registry";
import { GoogleAdapter } from "./adapters/google";
import { chatCompletionRequestSchema } from "@/lib/validations";
import {
  GatewayError,
  invalidRequestError,
  modelNotFoundError,
  modelNotAllowedError,
  noAvailableChannelError,
  upstreamError,
  internalError,
} from "./errors";
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  GatewayContext,
  UsageInfo,
} from "./types";

const MAX_RETRIES = 3;

/**
 * Main orchestrator for processing a chat completion request.
 * Handles the full pipeline: auth → rate limit → model resolve → balance check
 * → channel select → adapter → proxy → billing → logging → response.
 */
export async function processCompletionRequest(
  request: ChatCompletionRequest,
  authHeader: string | null,
  requestIp?: string
): Promise<Response> {
  const requestId = `chatcmpl-${generateId()}`;
  const startTime = Date.now();

  try {
    // 1. Validate request
    const parsed = chatCompletionRequestSchema.safeParse(request);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw invalidRequestError(
        issue?.message ?? "Invalid request",
        issue?.path?.[0]?.toString()
      );
    }

    // 2. Authenticate
    const { apiKey, user } = await authenticateRequest(authHeader);

    // 3. Rate limit
    await checkRateLimit(apiKey.id, apiKey.rateLimit);

    // 4. Resolve model
    const modelRecord = await db.model.findUnique({
      where: { modelId: request.model },
    });

    if (!modelRecord || !modelRecord.isActive) {
      throw modelNotFoundError(request.model);
    }

    // Check model whitelist
    const whitelist = await getModelWhitelist(apiKey.id);
    if (whitelist.length > 0 && !whitelist.includes(request.model)) {
      throw modelNotAllowedError(request.model);
    }

    // Build context
    const ctx: GatewayContext = {
      requestId,
      startTime,
      apiKey,
      user,
      model: {
        id: modelRecord.id,
        modelId: modelRecord.modelId,
        sellPrice: Number(modelRecord.sellPrice),
        sellOutPrice: Number(modelRecord.sellOutPrice),
      },
      requestIp,
    };

    // 5. Pre-check balance
    const estimatedInputTokens = estimateTokens(request.messages);
    await preCheckBalance(ctx, estimatedInputTokens);

    // 6-9. Channel selection + proxy with retry/fallback
    const failedChannelIds = new Set<string>();

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const channel = await selectChannel(request.model, failedChannelIds);
        ctx.channel = channel;

        const adapter = getAdapter(channel.providerName);
        if (!adapter) {
          failedChannelIds.add(channel.id);
          continue;
        }

        // Transform request
        const transformedBody = adapter.transformRequest(request);

        // Build URL and headers
        let url: string;
        if (request.stream) {
          url = buildStreamUrl(adapter, channel.baseUrl, request.model, channel.apiKey);
        } else {
          url = adapter.buildUrl(channel.baseUrl, request.model);
          // For Google non-streaming, append API key as query param
          if (adapter instanceof GoogleAdapter) {
            url += `?key=${channel.apiKey}`;
          }
        }
        const headers = adapter.buildHeaders(channel.apiKey);

        // Proxy to upstream
        const upstreamRes = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(transformedBody),
        });

        if (!upstreamRes.ok) {
          const errBody = await upstreamRes.text().catch(() => "");
          console.error(
            `[Gateway] Upstream ${channel.providerName} returned ${upstreamRes.status}: ${errBody}`
          );
          failedChannelIds.add(channel.id);
          continue;
        }

        // 10. Return response
        if (request.stream) {
          return handleStreamResponse(upstreamRes, adapter, ctx);
        } else {
          return await handleNonStreamResponse(upstreamRes, adapter, ctx);
        }
      } catch (err) {
        if (err instanceof GatewayError) throw err;
        // Network or other errors — try next channel
        console.error(`[Gateway] Attempt ${attempt + 1} failed:`, err);
        continue;
      }
    }

    throw noAvailableChannelError(request.model);
  } catch (err) {
    if (err instanceof GatewayError) {
      return new Response(JSON.stringify(err.toJSON()), {
        status: err.statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("[Gateway] Unexpected error:", err);
    const e = internalError();
    return new Response(JSON.stringify(e.toJSON()), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function handleStreamResponse(
  upstreamRes: Response,
  adapter: ReturnType<typeof getAdapter> & object,
  ctx: GatewayContext
): Response {
  const { stream, usagePromise } = createStreamTransformer(
    upstreamRes,
    adapter,
    ctx.model.modelId,
    ctx.requestId
  );

  // Use waitUntil to ensure billing completes after response is sent
  waitUntil(
    usagePromise.then(async ({ usage, content }) => {
      const duration = Date.now() - ctx.startTime;
      try {
        // If upstream didn't report tokens, estimate from accumulated content
        if (usage.completion_tokens === 0 && content) {
          usage.completion_tokens = estimateTextTokens(content);
          usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;
        }

        const { revenue, cost } = await chargeUser(ctx, usage);
        await logUsage(ctx, usage, revenue, cost, duration);
      } catch (err) {
        console.error("[Gateway] Post-stream billing error:", err);
        await logUsage(
          ctx,
          usage,
          0,
          0,
          duration,
          "error",
          err instanceof Error ? err.message : "Billing failed"
        );
      }
    })
  );

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Request-Id": ctx.requestId,
    },
  });
}

async function handleNonStreamResponse(
  upstreamRes: Response,
  adapter: ReturnType<typeof getAdapter> & object,
  ctx: GatewayContext
): Promise<Response> {
  const duration = Date.now() - ctx.startTime;
  const raw = await upstreamRes.json();

  try {
    const response: ChatCompletionResponse = adapter.transformResponse(
      raw,
      ctx.model.modelId,
      ctx.requestId
    );

    const usage: UsageInfo = response.usage ?? {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };

    const { revenue, cost } = await chargeUser(ctx, usage);
    await logUsage(ctx, usage, revenue, cost, duration);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": ctx.requestId,
      },
    });
  } catch (err) {
    if (err instanceof GatewayError) throw err;
    console.error("[Gateway] Response transform error:", err);
    throw upstreamError("Failed to process upstream response");
  }
}

function generateId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
