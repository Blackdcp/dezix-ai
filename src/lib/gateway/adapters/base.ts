import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
} from "../types";

/**
 * Base interface for all provider adapters.
 * Each adapter converts between OpenAI-compatible format and the provider's native format.
 */
export interface ProviderAdapter {
  readonly name: string;

  /** Build the full request URL */
  buildUrl(baseUrl: string, model: string): string;

  /** Build request headers */
  buildHeaders(apiKey: string): Record<string, string>;

  /** Transform OpenAI-format request body to provider's native format */
  transformRequest(request: ChatCompletionRequest): Record<string, unknown>;

  /** Transform provider's native response to OpenAI format */
  transformResponse(
    raw: Record<string, unknown>,
    model: string,
    requestId: string
  ): ChatCompletionResponse;

  /** Parse a single SSE line/event from the upstream stream into an OpenAI chunk */
  transformStreamChunk(
    raw: string,
    model: string,
    requestId: string
  ): ChatCompletionChunk | null;

  /** Extract usage info from a completed non-stream response */
  extractUsage(raw: Record<string, unknown>): {
    promptTokens: number;
    completionTokens: number;
  };
}
