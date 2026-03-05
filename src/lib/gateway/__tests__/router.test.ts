import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    channel: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock("@/lib/encryption", () => ({
  decrypt: vi.fn((val: string) => `decrypted:${val}`),
}));

import { selectChannel } from "../router";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { GatewayError } from "../errors";

const mockDbChannel = vi.mocked(db.channel);
const mockRedis = vi.mocked(redis);

function makeChannel(id: string, priority: number, weight: number) {
  return {
    id,
    providerId: `prov-${id}`,
    providerName: `Provider ${id}`,
    apiKey: `key-${id}`,
    baseUrl: `https://api-${id}.example.com`,
    priority,
    weight,
  };
}

describe("selectChannel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws noAvailableChannelError when no channels exist", async () => {
    mockRedis.get.mockResolvedValue(null as never);
    mockDbChannel.findMany.mockResolvedValue([] as never);

    await expect(selectChannel("gpt-4")).rejects.toThrow(GatewayError);
    await expect(selectChannel("gpt-4")).rejects.toThrow("No available channel");
  });

  it("returns the only channel when only one exists", async () => {
    const ch = makeChannel("ch1", 10, 1);
    mockRedis.get.mockResolvedValue([ch] as never);

    const result = await selectChannel("gpt-4");
    expect(result.id).toBe("ch1");
  });

  it("selects from highest priority group", async () => {
    const channels = [
      makeChannel("low", 1, 100),
      makeChannel("high", 10, 1),
    ];
    mockRedis.get.mockResolvedValue(channels as never);

    const result = await selectChannel("model-x");
    expect(result.id).toBe("high");
  });

  it("excludes failed channels", async () => {
    const channels = [
      makeChannel("ch1", 10, 1),
      makeChannel("ch2", 10, 1),
    ];
    mockRedis.get.mockResolvedValue(channels as never);

    const result = await selectChannel("model-x", new Set(["ch1"]));
    expect(result.id).toBe("ch2");
  });

  it("throws when all channels are failed", async () => {
    const channels = [
      makeChannel("ch1", 10, 1),
      makeChannel("ch2", 5, 1),
    ];
    mockRedis.get.mockResolvedValue(channels as never);

    await expect(
      selectChannel("model-x", new Set(["ch1", "ch2"]))
    ).rejects.toThrow("No available channel");
  });

  it("uses weighted random among same-priority channels", async () => {
    // Channel A has weight 1000, B has weight 1 — A should win most times
    const channels = [
      makeChannel("A", 10, 1000),
      makeChannel("B", 10, 1),
    ];
    mockRedis.get.mockResolvedValue(channels as never);

    const counts: Record<string, number> = { A: 0, B: 0 };
    for (let i = 0; i < 100; i++) {
      const result = await selectChannel("model-x");
      counts[result.id]++;
    }
    // A should get the vast majority
    expect(counts["A"]).toBeGreaterThan(80);
  });

  it("fetches from DB when cache misses", async () => {
    mockRedis.get.mockResolvedValue(null as never);
    mockDbChannel.findMany.mockResolvedValue([
      {
        id: "db-ch",
        providerId: "p1",
        apiKey: "encrypted-key",
        baseUrl: "",
        priority: 5,
        weight: 1,
        provider: { name: "TestProvider", baseUrl: "https://api.test.com" },
      },
    ] as never);

    const result = await selectChannel("model-y");
    expect(result.id).toBe("db-ch");
    expect(result.apiKey).toBe("decrypted:encrypted-key");
    expect(result.baseUrl).toBe("https://api.test.com");
    expect(mockRedis.set).toHaveBeenCalled();
  });

  it("uses channel baseUrl over provider baseUrl when available", async () => {
    mockRedis.get.mockResolvedValue(null as never);
    mockDbChannel.findMany.mockResolvedValue([
      {
        id: "ch-url",
        providerId: "p1",
        apiKey: "key",
        baseUrl: "https://custom.api.com",
        priority: 5,
        weight: 1,
        provider: { name: "Provider", baseUrl: "https://default.api.com" },
      },
    ] as never);

    const result = await selectChannel("model-z");
    expect(result.baseUrl).toBe("https://custom.api.com");
  });

  it("does not cache empty channel list", async () => {
    mockRedis.get.mockResolvedValue(null as never);
    mockDbChannel.findMany.mockResolvedValue([] as never);

    await expect(selectChannel("no-model")).rejects.toThrow();
    expect(mockRedis.set).not.toHaveBeenCalled();
  });
});
