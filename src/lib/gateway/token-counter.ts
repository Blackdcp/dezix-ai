import type { ChatMessage } from "./types";

/**
 * Heuristic token counter for pre-check estimation.
 * NOT used for billing — billing uses upstream-reported token counts.
 *
 * Rules of thumb:
 * - English text: ~4 characters per token
 * - Chinese text: ~1.5 characters per token
 * - Mixed: weighted average based on CJK character ratio
 */

const CJK_REGEX =
  /[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\u{2ceb0}-\u{2ebef}\u{30000}-\u{3134f}\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef]/gu;

function countTokensForText(text: string): number {
  if (!text) return 0;

  const totalChars = text.length;
  const cjkMatches = text.match(CJK_REGEX);
  const cjkChars = cjkMatches ? cjkMatches.length : 0;
  const nonCjkChars = totalChars - cjkChars;

  // CJK: ~1.5 chars/token, non-CJK: ~4 chars/token
  const cjkTokens = cjkChars / 1.5;
  const nonCjkTokens = nonCjkChars / 4;

  return Math.ceil(cjkTokens + nonCjkTokens);
}

/**
 * Estimate token count for an array of chat messages.
 * Adds ~4 tokens per message for formatting overhead.
 */
export function estimateTokens(messages: ChatMessage[]): number {
  let total = 0;
  for (const msg of messages) {
    // ~4 tokens per message overhead (role, formatting)
    total += 4;
    if (typeof msg.content === "string") {
      total += countTokensForText(msg.content);
    }
    if (msg.name) {
      total += countTokensForText(msg.name);
    }
  }
  // Add 2 tokens for priming
  total += 2;
  return total;
}

/**
 * Estimate tokens for a plain text string.
 */
export function estimateTextTokens(text: string): number {
  return countTokensForText(text);
}
