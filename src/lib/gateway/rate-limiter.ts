import { redis } from "@/lib/redis";
import { rateLimitError } from "./errors";

/**
 * Redis sliding window rate limiter.
 * Uses a sorted set with timestamps as scores.
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

  const now = Date.now();
  const windowStart = now - windowMs;
  const redisKey = `ratelimit:${keyId}`;

  // Atomic: remove expired entries, count current entries, add new entry, set TTL
  const multi = redis.multi();
  multi.zremrangebyscore(redisKey, 0, windowStart);
  multi.zcard(redisKey);
  multi.zadd(redisKey, now, `${now}:${Math.random().toString(36).slice(2, 8)}`);
  multi.pexpire(redisKey, windowMs);

  const results = await multi.exec();
  if (!results) {
    // Redis error, allow the request (fail open)
    return;
  }

  // results[1] is the zcard result: [error, count]
  const count = results[1][1] as number;
  if (count >= limit) {
    throw rateLimitError(
      `Rate limit exceeded: ${limit} requests per ${windowMs / 1000}s`
    );
  }
}

/**
 * IP-based rate limiter using the same sliding window algorithm.
 * Returns result instead of throwing, so callers can build custom responses.
 */
export async function checkIpRateLimit(
  ip: string,
  limit: number,
  windowMs: number = 60_000
): Promise<{ allowed: boolean; remaining: number }> {
  if (!ip) return { allowed: true, remaining: limit };

  const now = Date.now();
  const windowStart = now - windowMs;
  const redisKey = `iplimit:${ip}`;

  try {
    const multi = redis.multi();
    multi.zremrangebyscore(redisKey, 0, windowStart);
    multi.zcard(redisKey);
    multi.zadd(redisKey, now, `${now}:${Math.random().toString(36).slice(2, 8)}`);
    multi.pexpire(redisKey, windowMs);

    const results = await multi.exec();
    if (!results) {
      return { allowed: true, remaining: limit };
    }

    const count = results[1][1] as number;
    if (count >= limit) {
      return { allowed: false, remaining: 0 };
    }
    return { allowed: true, remaining: limit - count };
  } catch {
    // Fail open on Redis error
    return { allowed: true, remaining: limit };
  }
}
