import type { ProviderAdapter } from "./base";
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
} from "../types";

/**
 * Google Gemini REST API adapter.
 * API key is passed as a query parameter.
 * Uses generateContent / streamGenerateContent endpoints.
 */
export class GoogleAdapter implements ProviderAdapter {
  readonly name = "google";

  buildUrl(baseUrl: string, model: string): string {
    // Gemini REST: POST /v1beta/models/{model}:generateContent
    return `${baseUrl}/v1beta/models/${model}:generateContent`;
  }

  /** For streaming, the URL changes to streamGenerateContent */
  buildStreamUrl(baseUrl: string, model: string, apiKey: string): string {
    return `${baseUrl}/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  }

  buildHeaders(apiKey: string): Record<string, string> {
    // For non-streaming, API key goes as query param; we still set content-type
    // But we need to append ?key= to the URL. This is handled in the orchestrator.
    return {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    };
  }

  transformRequest(request: ChatCompletionRequest): Record<string, unknown> {
    const contents: Array<{
      role: string;
      parts: Array<{ text: string }>;
    }> = [];
    let systemInstruction: { parts: Array<{ text: string }> } | undefined;

    for (const msg of request.messages) {
      if (msg.role === "system") {
        systemInstruction = {
          parts: [{ text: typeof msg.content === "string" ? msg.content : "" }],
        };
      } else {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: typeof msg.content === "string" ? msg.content : "" }],
        });
      }
    }

    const body: Record<string, unknown> = { contents };
    if (systemInstruction) {
      body.systemInstruction = systemInstruction;
    }

    const generationConfig: Record<string, unknown> = {};
    if (request.max_tokens != null) generationConfig.maxOutputTokens = request.max_tokens;
    if (request.temperature != null) generationConfig.temperature = request.temperature;
    if (request.top_p != null) generationConfig.topP = request.top_p;
    if (request.stop) {
      generationConfig.stopSequences = Array.isArray(request.stop) ? request.stop : [request.stop];
    }
    if (Object.keys(generationConfig).length > 0) {
      body.generationConfig = generationConfig;
    }

    return body;
  }

  transformResponse(
    raw: Record<string, unknown>,
    model: string,
    requestId: string
  ): ChatCompletionResponse {
    const candidates = raw.candidates as Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
    const text =
      candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("") ?? "";

    const usageMetadata = raw.usageMetadata as {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    } | undefined;

    return {
      id: requestId,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: text },
          finish_reason: mapFinishReason(candidates?.[0]?.finishReason),
        },
      ],
      usage: {
        prompt_tokens: usageMetadata?.promptTokenCount ?? 0,
        completion_tokens: usageMetadata?.candidatesTokenCount ?? 0,
        total_tokens: usageMetadata?.totalTokenCount ?? 0,
      },
    };
  }

  transformStreamChunk(
    raw: string,
    model: string,
    requestId: string
  ): ChatCompletionChunk | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const jsonStr = trimmed.startsWith("data: ")
      ? trimmed.slice(6)
      : trimmed;

    let event: Record<string, unknown>;
    try {
      event = JSON.parse(jsonStr);
    } catch {
      return null;
    }

    const candidates = event.candidates as Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;

    const text =
      candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("") ?? "";

    const usageMetadata = event.usageMetadata as {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    } | undefined;

    const finishReason = candidates?.[0]?.finishReason;

    return {
      id: requestId,
      object: "chat.completion.chunk",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          delta: text ? { content: text } : {},
          finish_reason: finishReason ? mapFinishReason(finishReason) : null,
        },
      ],
      usage: usageMetadata
        ? {
            prompt_tokens: usageMetadata.promptTokenCount ?? 0,
            completion_tokens: usageMetadata.candidatesTokenCount ?? 0,
            total_tokens: usageMetadata.totalTokenCount ?? 0,
          }
        : undefined,
    };
  }

  extractUsage(raw: Record<string, unknown>): {
    promptTokens: number;
    completionTokens: number;
  } {
    const usageMetadata = raw.usageMetadata as {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
    } | undefined;
    return {
      promptTokens: usageMetadata?.promptTokenCount ?? 0,
      completionTokens: usageMetadata?.candidatesTokenCount ?? 0,
    };
  }
}

function mapFinishReason(reason?: string): string {
  switch (reason) {
    case "STOP":
      return "stop";
    case "MAX_TOKENS":
      return "length";
    case "SAFETY":
      return "content_filter";
    default:
      return reason?.toLowerCase() || "stop";
  }
}
