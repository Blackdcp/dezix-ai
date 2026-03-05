import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "crypto";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    apiKey: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

import { authenticateRequest, getModelWhitelist } from "../auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { GatewayError } from "../errors";

const mockDbApiKey = vi.mocked(db.apiKey);
const mockRedis = vi.mocked(redis);

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

describe("authenticateRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when Authorization header is missing", async () => {
    await expect(authenticateRequest(null)).rejects.toThrow(GatewayError);
    await expect(authenticateRequest(null)).rejects.toThrow(
      "Missing or invalid Authorization header"
    );
  });

  it("throws when Authorization header does not start with Bearer", async () => {
    await expect(authenticateRequest("Basic abc")).rejects.toThrow(GatewayError);
  });

  it("throws when token is empty after Bearer", async () => {
    await expect(authenticateRequest("Bearer ")).rejects.toThrow("Empty API key");
  });

  it("returns cached data when Redis hit", async () => {
    const cachedData = {
      apiKey: { id: "key1", userId: "u1", rateLimit: 100 },
      user: { id: "u1", balance: 50 },
      isActive: true,
      expiresAt: null,
      totalQuota: null,
      usedQuota: 0,
      modelWhitelist: [],
    };
    mockRedis.get.mockResolvedValue(cachedData as never);

    const result = await authenticateRequest("Bearer sk-dezix-test123");
    expect(result.apiKey.id).toBe("key1");
    expect(result.user.id).toBe("u1");
    expect(mockDbApiKey.findUnique).not.toHaveBeenCalled();
  });

  it("falls through to DB when cache is malformed", async () => {
    // Cached data with isActive=false triggers validation error → falls through
    mockRedis.get.mockResolvedValue({
      apiKey: { id: "k1", userId: "u1", rateLimit: null },
      user: { id: "u1", balance: 10 },
      isActive: false,
      expiresAt: null,
      totalQuota: null,
      usedQuota: 0,
      modelWhitelist: [],
    } as never);

    // DB also returns null → throws
    mockDbApiKey.findUnique.mockResolvedValue(null as never);

    await expect(authenticateRequest("Bearer sk-dezix-abc")).rejects.toThrow(
      GatewayError
    );
    expect(mockRedis.del).toHaveBeenCalled();
  });

  it("throws when key not found in DB", async () => {
    mockRedis.get.mockResolvedValue(null as never);
    mockDbApiKey.findUnique.mockResolvedValue(null as never);

    await expect(authenticateRequest("Bearer sk-dezix-notexist")).rejects.toThrow(
      "Invalid API key"
    );
  });

  it("returns data from DB and caches it", async () => {
    mockRedis.get.mockResolvedValue(null as never);
    mockDbApiKey.findUnique.mockResolvedValue({
      id: "key2",
      userId: "u2",
      rateLimit: 60,
      isActive: true,
      expiresAt: null,
      totalQuota: null,
      usedQuota: 0,
      modelWhitelist: [],
      user: { id: "u2", balance: 100 },
    } as never);

    const result = await authenticateRequest("Bearer sk-dezix-fromdb");
    expect(result.apiKey.id).toBe("key2");
    expect(result.user.balance).toBe(100);
    expect(mockRedis.set).toHaveBeenCalled();
  });

  it("throws when key is deactivated in DB", async () => {
    mockRedis.get.mockResolvedValue(null as never);
    mockDbApiKey.findUnique.mockResolvedValue({
      id: "key3",
      userId: "u3",
      rateLimit: null,
      isActive: false,
      expiresAt: null,
      totalQuota: null,
      usedQuota: 0,
      modelWhitelist: [],
      user: { id: "u3", balance: 50 },
    } as never);

    await expect(authenticateRequest("Bearer sk-dezix-inactive")).rejects.toThrow(
      "API key has been deactivated"
    );
  });

  it("throws when key has expired", async () => {
    const pastDate = new Date("2020-01-01");
    mockRedis.get.mockResolvedValue(null as never);
    mockDbApiKey.findUnique.mockResolvedValue({
      id: "key4",
      userId: "u4",
      rateLimit: null,
      isActive: true,
      expiresAt: pastDate,
      totalQuota: null,
      usedQuota: 0,
      modelWhitelist: [],
      user: { id: "u4", balance: 50 },
    } as never);

    await expect(authenticateRequest("Bearer sk-dezix-expired")).rejects.toThrow(
      "API key has expired"
    );
  });

  it("throws when quota is exceeded", async () => {
    mockRedis.get.mockResolvedValue(null as never);
    mockDbApiKey.findUnique.mockResolvedValue({
      id: "key5",
      userId: "u5",
      rateLimit: null,
      isActive: true,
      expiresAt: null,
      totalQuota: 1000,
      usedQuota: 1000,
      modelWhitelist: [],
      user: { id: "u5", balance: 50 },
    } as never);

    await expect(authenticateRequest("Bearer sk-dezix-quota")).rejects.toThrow(
      "API key quota exceeded"
    );
  });

  it("hashes the token with SHA-256 for lookup", async () => {
    const token = "sk-dezix-hashtest";
    const expectedHash = sha256(token);

    mockRedis.get.mockResolvedValue(null as never);
    mockDbApiKey.findUnique.mockResolvedValue(null as never);

    await expect(authenticateRequest(`Bearer ${token}`)).rejects.toThrow();
    expect(mockDbApiKey.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { keyHash: expectedHash },
      })
    );
  });
});

describe("getModelWhitelist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns cached whitelist", async () => {
    mockRedis.get.mockResolvedValue(["gpt-4", "claude-4"] as never);
    const result = await getModelWhitelist("key1");
    expect(result).toEqual(["gpt-4", "claude-4"]);
    expect(mockDbApiKey.findUnique).not.toHaveBeenCalled();
  });

  it("queries DB and caches when cache misses", async () => {
    mockRedis.get.mockResolvedValue(null as never);
    mockDbApiKey.findUnique.mockResolvedValue({
      modelWhitelist: ["deepseek-v3"],
    } as never);

    const result = await getModelWhitelist("key2");
    expect(result).toEqual(["deepseek-v3"]);
    expect(mockRedis.set).toHaveBeenCalled();
  });

  it("returns empty array when key not found", async () => {
    mockRedis.get.mockResolvedValue(null as never);
    mockDbApiKey.findUnique.mockResolvedValue(null as never);

    const result = await getModelWhitelist("nonexist");
    expect(result).toEqual([]);
  });
});
