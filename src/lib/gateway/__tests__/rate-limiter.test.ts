import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock redis
const mockMulti = {
  zremrangebyscore: vi.fn().mockReturnThis(),
  zcard: vi.fn().mockReturnThis(),
  zadd: vi.fn().mockReturnThis(),
  pexpire: vi.fn().mockReturnThis(),
  exec: vi.fn(),
};

vi.mock("@/lib/redis", () => ({
  redis: {
    multi: () => mockMulti,
  },
}));

import { checkIpRateLimit } from "../rate-limiter";

describe("checkIpRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows request when under limit", async () => {
    mockMulti.exec.mockResolvedValue([
      [null, 0],  // zremrangebyscore
      [null, 3],  // zcard: 3 requests so far
      [null, 1],  // zadd
      [null, 1],  // pexpire
    ]);

    const result = await checkIpRateLimit("1.2.3.4", 10);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(7); // 10 - 3
  });

  it("blocks request when at limit", async () => {
    mockMulti.exec.mockResolvedValue([
      [null, 0],
      [null, 10], // zcard: 10 requests (at limit)
      [null, 1],
      [null, 1],
    ]);

    const result = await checkIpRateLimit("1.2.3.4", 10);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("allows request when ip is empty", async () => {
    const result = await checkIpRateLimit("", 10);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(10);
  });

  it("fails open on Redis error", async () => {
    mockMulti.exec.mockRejectedValue(new Error("Redis connection failed"));

    const result = await checkIpRateLimit("1.2.3.4", 10);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(10);
  });

  it("fails open when exec returns null", async () => {
    mockMulti.exec.mockResolvedValue(null);

    const result = await checkIpRateLimit("1.2.3.4", 10);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(10);
  });
});
