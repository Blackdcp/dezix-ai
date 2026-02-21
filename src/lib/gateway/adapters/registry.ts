import type { ProviderAdapter } from "./base";
import { OpenAIAdapter } from "./openai";
import { AnthropicAdapter } from "./anthropic";
import { GoogleAdapter } from "./google";
import { DeepSeekAdapter } from "./deepseek";

const adapters: Record<string, ProviderAdapter> = {
  openai: new OpenAIAdapter(),
  anthropic: new AnthropicAdapter(),
  google: new GoogleAdapter(),
  deepseek: new DeepSeekAdapter(),
  qiniu: new DeepSeekAdapter(), // Qiniu (Sufy) uses OpenAI-compatible API; DeepSeek adapter's URL path matches
};

/**
 * Get the provider adapter by provider name (lowercase).
 */
export function getAdapter(providerName: string): ProviderAdapter | undefined {
  return adapters[providerName.toLowerCase()];
}

/**
 * Register a custom adapter at runtime.
 */
export function registerAdapter(
  providerName: string,
  adapter: ProviderAdapter
): void {
  adapters[providerName.toLowerCase()] = adapter;
}
