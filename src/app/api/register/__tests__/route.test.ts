import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock redis (needed by rate-limiter)
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

// Mock bcrypt for speed
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2a$12$hashedpassword"),
  },
}));

import { POST } from "../route";
import { db } from "@/lib/db";

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: rate limit allows requests
    mockMulti.exec.mockResolvedValue([
      [null, 0], [null, 0], [null, 1], [null, 1],
    ]);
  });

  it("creates a new user successfully", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);
    vi.mocked(db.user.create).mockResolvedValue({} as never);

    const response = await POST(makeRequest({
      name: "Test User",
      email: "test@example.com",
      password: "12345678",
    }));

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.message).toBe("注册成功");
    expect(db.user.create).toHaveBeenCalledTimes(1);
  });

  it("rejects duplicate email", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "existing" } as never);

    const response = await POST(makeRequest({
      name: "Test",
      email: "existing@example.com",
      password: "12345678",
    }));

    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toContain("已被注册");
  });

  it("rejects invalid input (missing fields)", async () => {
    const response = await POST(makeRequest({
      name: "Test",
    }));

    expect(response.status).toBe(400);
  });

  it("rejects short password", async () => {
    const response = await POST(makeRequest({
      name: "Test",
      email: "test@example.com",
      password: "short",
    }));

    expect(response.status).toBe(400);
  });

  it("rejects invalid email", async () => {
    const response = await POST(makeRequest({
      name: "Test",
      email: "not-an-email",
      password: "12345678",
    }));

    expect(response.status).toBe(400);
  });

  it("handles referral code", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);
    vi.mocked(db.user.findFirst).mockResolvedValue({ id: "referrer-id" } as never);
    vi.mocked(db.user.create).mockResolvedValue({} as never);

    const response = await POST(makeRequest({
      name: "New User",
      email: "new@example.com",
      password: "12345678",
      referralCode: "abc123",
    }));

    expect(response.status).toBe(201);
    expect(db.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          referredBy: "referrer-id",
        }),
      })
    );
  });

  it("returns 429 when rate limited", async () => {
    mockMulti.exec.mockResolvedValue([
      [null, 0], [null, 5], [null, 1], [null, 1],
    ]);

    const response = await POST(makeRequest({
      name: "Test",
      email: "test@example.com",
      password: "12345678",
    }));

    expect(response.status).toBe(429);
  });
});
