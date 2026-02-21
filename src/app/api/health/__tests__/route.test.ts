import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db and redis
vi.mock("@/lib/db", () => ({
  db: {
    $executeRaw: vi.fn(),
  },
}));

vi.mock("@/lib/redis", () => ({
  redis: {
    ping: vi.fn(),
  },
}));

import { GET } from "../route";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns healthy when both services are up", async () => {
    vi.mocked(db.$executeRaw).mockResolvedValue(1);
    vi.mocked(redis.ping).mockResolvedValue("PONG");

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.checks.postgres.status).toBe("healthy");
    expect(data.checks.redis.status).toBe("healthy");
    expect(data.timestamp).toBeDefined();
  });

  it("returns unhealthy when postgres is down", async () => {
    vi.mocked(db.$executeRaw).mockRejectedValue(new Error("Connection refused"));
    vi.mocked(redis.ping).mockResolvedValue("PONG");

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("unhealthy");
    expect(data.checks.postgres.status).toBe("unhealthy");
    expect(data.checks.redis.status).toBe("healthy");
  });

  it("returns unhealthy when redis is down", async () => {
    vi.mocked(db.$executeRaw).mockResolvedValue(1);
    vi.mocked(redis.ping).mockRejectedValue(new Error("Connection refused"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("unhealthy");
    expect(data.checks.postgres.status).toBe("healthy");
    expect(data.checks.redis.status).toBe("unhealthy");
  });

  it("returns unhealthy when both services are down", async () => {
    vi.mocked(db.$executeRaw).mockRejectedValue(new Error("pg error"));
    vi.mocked(redis.ping).mockRejectedValue(new Error("redis error"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("unhealthy");
  });
});
