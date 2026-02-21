import { db } from "@/lib/db";
import type { GatewayContext, UsageInfo } from "./types";

/**
 * Log a completed request to the UsageLog table.
 * Returns a Promise so callers can await if needed (e.g. inside waitUntil).
 */
export async function logUsage(
  ctx: GatewayContext,
  usage: UsageInfo,
  revenue: number,
  cost: number,
  duration: number,
  status: "success" | "error" = "success",
  errorMessage?: string
): Promise<void> {
  try {
    await db.usageLog.create({
      data: {
        userId: ctx.user.id,
        apiKeyId: ctx.apiKey.id,
        channelId: ctx.channel?.id,
        modelId: ctx.model.id,
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        cost: cost.toFixed(8),
        revenue: revenue.toFixed(8),
        duration,
        status,
        errorMessage,
        requestIp: ctx.requestIp,
      },
    });
  } catch (err) {
    console.error("[Gateway Logger] Failed to log usage:", err);
  }
}
