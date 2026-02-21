import { describe, it, expect } from "vitest";
import { estimateTokens, estimateTextTokens } from "../token-counter";
import type { ChatMessage } from "../types";

describe("estimateTokens", () => {
  it("returns priming tokens for empty messages", () => {
    const result = estimateTokens([]);
    expect(result).toBe(2); // priming only
  });

  it("estimates tokens for English text", () => {
    const messages: ChatMessage[] = [
      { role: "user", content: "Hello, how are you doing today?" },
    ];
    const result = estimateTokens(messages);
    // 30 chars / 4 = 7.5 → 8, + 4 overhead + 2 priming = 14
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(50);
  });

  it("estimates tokens for Chinese text", () => {
    const messages: ChatMessage[] = [
      { role: "user", content: "你好，今天天气怎么样？" },
    ];
    const result = estimateTokens(messages);
    // CJK chars: ~1.5 chars/token, higher token density
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(50);
  });

  it("handles multiple messages", () => {
    const messages: ChatMessage[] = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
    ];
    const result = estimateTokens(messages);
    // 3 messages * 4 overhead + content tokens + 2 priming
    expect(result).toBeGreaterThan(10);
  });

  it("handles empty content", () => {
    const messages: ChatMessage[] = [
      { role: "assistant", content: "" },
    ];
    const result = estimateTokens(messages);
    // 4 overhead + 2 priming
    expect(result).toBe(6);
  });

  it("handles messages without content", () => {
    const messages: ChatMessage[] = [
      { role: "assistant" },
    ];
    const result = estimateTokens(messages);
    expect(result).toBe(6);
  });
});

describe("estimateTextTokens", () => {
  it("returns 0 for empty string", () => {
    expect(estimateTextTokens("")).toBe(0);
  });

  it("estimates English text tokens", () => {
    const result = estimateTextTokens("The quick brown fox jumps over the lazy dog");
    // 43 chars / 4 = ~11 tokens
    expect(result).toBeGreaterThan(5);
    expect(result).toBeLessThan(20);
  });

  it("estimates Chinese text tokens", () => {
    const result = estimateTextTokens("人工智能改变世界");
    // 8 CJK chars / 1.5 ≈ 6 tokens
    expect(result).toBeGreaterThan(3);
    expect(result).toBeLessThan(15);
  });
});
