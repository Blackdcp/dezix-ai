import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db before importing billing
vi.mock("@/lib/db", () => ({
  db: {
    $executeRaw: vi.fn(),
    user: { findUnique: vi.fn() },
    transaction: { create: vi.fn() },
    apiKey: { update: vi.fn() },
  },
}));

import { preCheckBalance } from "../billing";
import type { GatewayContext } from "../types";

function makeCtx(balance: number, sellPrice = 0.01, sellOutPrice = 0.02): GatewayContext {
  return {
    requestId: "test-req",
    startTime: Date.now(),
    apiKey: { id: "key1", rateLimit: null },
    user: { id: "user1", balance },
    model: { id: "m1", modelId: "gpt-4", sellPrice, sellOutPrice },
  } as GatewayContext;
}

describe("preCheckBalance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes when balance is sufficient", async () => {
    const ctx = makeCtx(10.0);
    await expect(preCheckBalance(ctx, 100)).resolves.toBeUndefined();
  });

  it("throws when balance is insufficient", async () => {
    const ctx = makeCtx(0.001);
    await expect(preCheckBalance(ctx, 10000)).rejects.toThrow();
  });

  it("passes with zero-cost model", async () => {
    const ctx = makeCtx(0, 0, 0);
    await expect(preCheckBalance(ctx, 500)).resolves.toBeUndefined();
  });

  it("estimates output tokens as at least 100", async () => {
    // With 10 input tokens, output estimate = max(10*0.5, 100) = 100
    // Cost = (10/1000)*0.01 + (100/1000)*0.02 = 0.0001 + 0.002 = 0.0021
    const ctx = makeCtx(0.002);
    await expect(preCheckBalance(ctx, 10)).rejects.toThrow();
  });
});
