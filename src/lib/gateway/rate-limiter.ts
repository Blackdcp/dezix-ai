import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import { rateLimitError } from "./errors";

const rlCache = new Map<string, Ratelimit>();

function getRatelimiter(limit: number, windowMs: number): Ratelimit {
  const key = `${limit}:${windowMs}`;
  if (!rlCache.has(key)) {
    rlCache.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
        prefix: "rl",
      })
    );
  }
  return rlCache.get(key)!;
}

/**
 * Per-API-key rate limiter using @upstash/ratelimit sliding window.
 *
 * @param keyId - The API key ID
 * @param limit - Max requests per window
 * @param windowMs - Window size in milliseconds (default: 60s)
 */
export async function checkRateLimit(
  keyId: string,
  limit: number | null,
  windowMs: number = 60_000
): Promise<void> {
  // No limit configured → skip
  if (!limit || limit <= 0) return;

  const { success } = await getRatelimiter(limit, windowMs).limit(keyId);
  if (!success) {
    throw rateLimitError(
      `Rate limit exceeded: ${limit} requests per ${windowMs / 1000}s`
    );
  }
}

/**
 * IP-based rate limiter using @upstash/ratelimit sliding window.
 * Returns result instead of throwing, so callers can build custom responses.
 */
export async function checkIpRateLimit(
  ip: string,
  limit: number,
  windowMs: number = 60_000
): Promise<{ allowed: boolean; remaining: number }> {
  if (!ip) return { allowed: true, remaining: limit };

  try {
    const { success, remaining } = await getRatelimiter(limit, windowMs).limit(
      `ip:${ip}`
    );
    return { allowed: success, remaining };
  } catch {
    // Fail open on Redis error
    return { allowed: true, remaining: limit };
  }
}
