import { OpenAIAdapter } from "./openai";

/**
 * DeepSeek adapter — OpenAI-compatible API.
 * Inherits from OpenAIAdapter, only overrides the name and URL path.
 */
export class DeepSeekAdapter extends OpenAIAdapter {
  readonly name = "deepseek";

  buildUrl(baseUrl: string): string {
    return `${baseUrl}/chat/completions`;
  }
}
