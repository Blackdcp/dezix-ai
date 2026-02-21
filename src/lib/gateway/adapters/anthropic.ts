import type { ProviderAdapter } from "./base";
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
} from "../types";

/**
 * Anthropic Messages API adapter.
 * Converts between OpenAI format and Anthropic's native Messages API format.
 */
export class AnthropicAdapter implements ProviderAdapter {
  readonly name = "anthropic";

  buildUrl(baseUrl: string): string {
    return `${baseUrl}/v1/messages`;
  }

  buildHeaders(apiKey: string): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    };
  }

  transformRequest(request: ChatCompletionRequest): Record<string, unknown> {
    // Extract system message(s) into top-level `system` param
    const systemMessages: string[] = [];
    const messages: Array<{ role: string; content: string }> = [];

    for (const msg of request.messages) {
      if (msg.role === "system") {
        if (typeof msg.content === "string") {
          systemMessages.push(msg.content);
        }
      } else {
        messages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: typeof msg.content === "string" ? msg.content : "",
        });
      }
    }

    const body: Record<string, unknown> = {
      model: request.model,
      messages,
      max_tokens: request.max_tokens ?? 4096,
      stream: request.stream ?? false,
    };

    if (systemMessages.length > 0) {
      body.system = systemMessages.join("\n\n");
    }
    if (request.temperature != null) body.temperature = request.temperature;
    if (request.top_p != null) body.top_p = request.top_p;
    if (request.stop) body.stop_sequences = Array.isArray(request.stop) ? request.stop : [request.stop];

    return body;
  }

  transformResponse(
    raw: Record<string, unknown>,
    model: string,
    requestId: string
  ): ChatCompletionResponse {
    const content = raw.content as Array<{ type: string; text?: string }>;
    const text = content
      ?.filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("") ?? "";

    const usage = raw.usage as {
      input_tokens?: number;
      output_tokens?: number;
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
          finish_reason: mapStopReason(raw.stop_reason as string),
        },
      ],
      usage: {
        prompt_tokens: usage?.input_tokens ?? 0,
        completion_tokens: usage?.output_tokens ?? 0,
        total_tokens: (usage?.input_tokens ?? 0) + (usage?.output_tokens ?? 0),
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

    // Anthropic SSE format: "event: xxx\ndata: {...}"
    // We receive line by line, so we handle data lines
    if (trimmed.startsWith("event:")) return null;

    const jsonStr = trimmed.startsWith("data: ")
      ? trimmed.slice(6)
      : trimmed;

    let event: Record<string, unknown>;
    try {
      event = JSON.parse(jsonStr);
    } catch {
      return null;
    }

    const eventType = event.type as string;

    if (eventType === "content_block_delta") {
      const delta = event.delta as { type: string; text?: string };
      if (delta?.type === "text_delta" && delta.text) {
        return {
          id: requestId,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model,
          choices: [
            {
              index: 0,
              delta: { content: delta.text },
              finish_reason: null,
            },
          ],
        };
      }
    }

    if (eventType === "message_delta") {
      const delta = event.delta as { stop_reason?: string };
      const usage = event.usage as { output_tokens?: number };
      return {
        id: requestId,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
          {
            index: 0,
            delta: {},
            finish_reason: mapStopReason(delta?.stop_reason ?? ""),
          },
        ],
        usage: usage?.output_tokens
          ? {
              prompt_tokens: 0, // Not available in delta
              completion_tokens: usage.output_tokens,
              total_tokens: usage.output_tokens,
            }
          : undefined,
      };
    }

    if (eventType === "message_start") {
      const message = event.message as Record<string, unknown>;
      const usage = message?.usage as { input_tokens?: number };
      if (usage?.input_tokens) {
        return {
          id: requestId,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model,
          choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null }],
          usage: {
            prompt_tokens: usage.input_tokens,
            completion_tokens: 0,
            total_tokens: usage.input_tokens,
          },
        };
      }
    }

    return null;
  }

  extractUsage(raw: Record<string, unknown>): {
    promptTokens: number;
    completionTokens: number;
  } {
    const usage = raw.usage as {
      input_tokens?: number;
      output_tokens?: number;
    } | undefined;
    return {
      promptTokens: usage?.input_tokens ?? 0,
      completionTokens: usage?.output_tokens ?? 0,
    };
  }
}

function mapStopReason(reason: string): string {
  switch (reason) {
    case "end_turn":
      return "stop";
    case "max_tokens":
      return "length";
    case "stop_sequence":
      return "stop";
    default:
      return reason || "stop";
  }
}
