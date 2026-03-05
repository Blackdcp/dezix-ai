import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    usageLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

import { logUsage } from "../../gateway/logger";
import { db } from "@/lib/db";
import type { GatewayContext } from "../../gateway/types";

const mockCtx: GatewayContext = {
  user: { id: "user-1", balance: 10 },
  apiKey: { id: "key-1", userId: "user-1", rateLimit: 60 },
  channel: { id: "ch-1", providerId: "p-1", providerName: "openai", baseUrl: "https://api.example.com", apiKey: "sk-test" },
  model: { id: "model-1", modelId: "gpt-4o", sellPrice: 0.01, sellOutPrice: 0.03 },
  requestIp: "1.2.3.4",
  requestId: "req-123",
  startTime: Date.now(),
};

describe("logUsage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a usage log entry with correct data", async () => {
    await logUsage(
      mockCtx,
      { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
      0.005,
      0.002,
      320,
      "success"
    );

    expect(db.usageLog.create).toHaveBeenCalledOnce();
    const call = vi.mocked(db.usageLog.create).mock.calls[0][0];
    expect(call.data).toMatchObject({
      userId: "user-1",
      apiKeyId: "key-1",
      channelId: "ch-1",
      modelId: "model-1",
      promptTokens: 100,
      completionTokens: 50,
      totalTokens: 150,
      duration: 320,
      status: "success",
      requestIp: "1.2.3.4",
    });
    expect(call.data.cost).toBe("0.00200000");
    expect(call.data.revenue).toBe("0.00500000");
  });

  it("defaults status to success", async () => {
    await logUsage(
      mockCtx,
      { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      0.001,
      0.0005,
      100
    );

    const call = vi.mocked(db.usageLog.create).mock.calls[0][0];
    expect(call.data.status).toBe("success");
  });

  it("logs error status with errorMessage", async () => {
    await logUsage(
      mockCtx,
      { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      0,
      0,
      50,
      "error",
      "upstream timeout"
    );

    const call = vi.mocked(db.usageLog.create).mock.calls[0][0];
    expect(call.data.status).toBe("error");
    expect(call.data.errorMessage).toBe("upstream timeout");
  });

  it("handles undefined channel gracefully", async () => {
    const ctxNoChannel: GatewayContext = { ...mockCtx, channel: undefined };
    await logUsage(
      ctxNoChannel,
      { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      0.001,
      0.0005,
      80
    );

    const call = vi.mocked(db.usageLog.create).mock.calls[0][0];
    expect(call.data.channelId).toBeUndefined();
  });

  it("does not throw when db.create fails", async () => {
    vi.mocked(db.usageLog.create).mockRejectedValueOnce(new Error("DB down"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      logUsage(
        mockCtx,
        { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        0.001,
        0.0005,
        80
      )
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledOnce();
    consoleSpy.mockRestore();
  });
});
