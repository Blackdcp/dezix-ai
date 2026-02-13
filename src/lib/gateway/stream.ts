import type { ProviderAdapter } from "./adapters/base";
import type { ChatCompletionChunk, GatewayContext, UsageInfo } from "./types";
import { GoogleAdapter } from "./adapters/google";

/**
 * Create a ReadableStream that proxies an upstream SSE response,
 * transforms each chunk through the adapter, and emits OpenAI-format SSE.
 *
 * Returns the stream and a promise that resolves with accumulated usage data
 * once the stream finishes.
 */
export function createStreamTransformer(
  upstreamResponse: Response,
  adapter: ProviderAdapter,
  model: string,
  requestId: string
): {
  stream: ReadableStream<Uint8Array>;
  usagePromise: Promise<{ usage: UsageInfo; content: string }>;
} {
  let accumulatedContent = "";
  let promptTokens = 0;
  let completionTokens = 0;
  let resolveUsage: (value: { usage: UsageInfo; content: string }) => void;

  const usagePromise = new Promise<{ usage: UsageInfo; content: string }>(
    (resolve) => {
      resolveUsage = resolve;
    }
  );

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstreamResponse.body?.getReader();
      if (!reader) {
        controller.close();
        resolveUsage!({
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          content: "",
        });
        return;
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;

            const chunk = adapter.transformStreamChunk(line, model, requestId);
            if (!chunk) {
              // Check for [DONE] signal
              if (line.trim() === "data: [DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              }
              continue;
            }

            // Accumulate content
            const delta = chunk.choices?.[0]?.delta;
            if (delta?.content) {
              accumulatedContent += delta.content;
            }

            // Track usage if reported in chunks
            if (chunk.usage) {
              if (chunk.usage.prompt_tokens > 0) {
                promptTokens = chunk.usage.prompt_tokens;
              }
              if (chunk.usage.completion_tokens > 0) {
                completionTokens = chunk.usage.completion_tokens;
              }
            }

            // Emit as OpenAI SSE format
            const sseData = `data: ${JSON.stringify(chunk)}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          const chunk = adapter.transformStreamChunk(buffer, model, requestId);
          if (chunk) {
            const delta = chunk.choices?.[0]?.delta;
            if (delta?.content) {
              accumulatedContent += delta.content;
            }
            if (chunk.usage) {
              if (chunk.usage.prompt_tokens > 0) promptTokens = chunk.usage.prompt_tokens;
              if (chunk.usage.completion_tokens > 0) completionTokens = chunk.usage.completion_tokens;
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          }
        }

        // Send [DONE] if not already sent
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
        resolveUsage!({
          usage: {
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: promptTokens + completionTokens,
          },
          content: accumulatedContent,
        });
      }
    },
  });

  return { stream, usagePromise };
}

/**
 * Build the upstream request URL for streaming.
 * Google Gemini uses a different endpoint for streaming.
 */
export function buildStreamUrl(
  adapter: ProviderAdapter,
  baseUrl: string,
  model: string,
  apiKey: string
): string {
  if (adapter instanceof GoogleAdapter) {
    return adapter.buildStreamUrl(baseUrl, model, apiKey);
  }
  return adapter.buildUrl(baseUrl, model);
}
