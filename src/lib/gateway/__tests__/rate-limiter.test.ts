import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @upstash/ratelimit
const mockLimit = vi.fn();

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class MockRatelimit {
    static slidingWindow() {
      return {};
    }
    constructor() {}
    limit = mockLimit;
  },
}));

// Mock redis (needed by rate-limiter module)
vi.mock("@/lib/redis", () => ({
  redis: {},
}));

import { checkIpRateLimit } from "../rate-limiter";

describe("checkIpRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows request when under limit", async () => {
    mockLimit.mockResolvedValue({
      success: true,
      remaining: 7,
    });

    const result = await checkIpRateLimit("1.2.3.4", 10);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(7);
  });

  it("blocks request when at limit", async () => {
    mockLimit.mockResolvedValue({
      success: false,
      remaining: 0,
    });

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
    mockLimit.mockRejectedValue(new Error("Redis connection failed"));

    const result = await checkIpRateLimit("1.2.3.4", 10);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(10);
  });
});
