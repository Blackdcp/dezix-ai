import type { ProviderAdapter } from "./base";
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  UsageInfo,
} from "../types";

export class OpenAIAdapter implements ProviderAdapter {
  readonly name: string = "openai";

  buildUrl(baseUrl: string): string {
    return `${baseUrl}/v1/chat/completions`;
  }

  buildHeaders(apiKey: string): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
  }

  transformRequest(request: ChatCompletionRequest): Record<string, unknown> {
    const body: Record<string, unknown> = { ...request };
    // Inject stream_options to get usage in stream mode
    if (request.stream) {
      body.stream_options = { include_usage: true };
    }
    return body;
  }

  transformResponse(
    raw: Record<string, unknown>,
    _model: string,
    _requestId: string
  ): ChatCompletionResponse {
    // OpenAI response is already in the correct format
    return raw as unknown as ChatCompletionResponse;
  }

  transformStreamChunk(
    raw: string,
    _model: string,
    _requestId: string
  ): ChatCompletionChunk | null {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "data: [DONE]") return null;

    const jsonStr = trimmed.startsWith("data: ")
      ? trimmed.slice(6)
      : trimmed;

    try {
      return JSON.parse(jsonStr) as ChatCompletionChunk;
    } catch {
      return null;
    }
  }

  extractUsage(raw: Record<string, unknown>): {
    promptTokens: number;
    completionTokens: number;
  } {
    const usage = raw.usage as UsageInfo | undefined;
    return {
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
    };
  }
}
