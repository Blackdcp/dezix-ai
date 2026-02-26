import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { insufficientBalanceError } from "./errors";
import type { GatewayContext, UsageInfo } from "./types";

/**
 * Pre-check: estimate whether the user has enough balance for this request.
 * This is a read-only check using estimated input tokens.
 * Does NOT deduct — just a fast-fail gate.
 */
export async function preCheckBalance(
  ctx: GatewayContext,
  estimatedInputTokens: number
): Promise<void> {
  // Estimate cost: assume at least some output tokens
  const estimatedOutputTokens = Math.max(estimatedInputTokens * 0.5, 100);
  const estimatedCost =
    (estimatedInputTokens / 1000) * ctx.model.sellPrice +
    (estimatedOutputTokens / 1000) * ctx.model.sellOutPrice;

  if (ctx.user.balance < estimatedCost) {
    throw insufficientBalanceError();
  }
}

/**
 * Charge the user atomically after a successful request.
 * Uses raw SQL to avoid read-then-write race conditions:
 *   UPDATE users SET balance = balance - cost WHERE id = ? AND balance >= cost
 *
 * Also records the Transaction and updates ApiKey.usedQuota.
 */
export async function chargeUser(
  ctx: GatewayContext,
  usage: UsageInfo
): Promise<{ revenue: number; cost: number }> {
  const revenue =
    (usage.prompt_tokens / 1000) * ctx.model.sellPrice +
    (usage.completion_tokens / 1000) * ctx.model.sellOutPrice;

  // Cost is what we pay upstream — for logging purposes
  // For now we use a simple ratio (sell price is the revenue, cost is tracked separately)
  const cost = revenue * 0.6; // Rough estimate; actual cost from Model.inputPrice/outputPrice

  if (revenue <= 0) {
    return { revenue: 0, cost: 0 };
  }

  const revenueDecimal = new Prisma.Decimal(revenue.toFixed(8));

  // Idempotency: check if this request was already charged (e.g. retry)
  const existing = await db.transaction.findFirst({
    where: { referenceId: ctx.requestId, type: "USAGE" },
    select: { id: true },
  });
  if (existing) {
    return { revenue, cost };
  }

  // Atomic balance deduction with RETURNING to get the new balance in one query
  const rows = await db.$queryRaw<{ balance: Prisma.Decimal }[]>`
    UPDATE users
    SET balance = balance - ${revenueDecimal}::decimal,
        "updatedAt" = NOW()
    WHERE id = ${ctx.user.id}
      AND balance >= ${revenueDecimal}::decimal
    RETURNING balance
  `;

  if (rows.length === 0) {
    throw insufficientBalanceError();
  }

  const newBalance = Number(rows[0].balance);

  // Record transaction + update ApiKey quota in parallel
  await Promise.all([
    db.transaction.create({
      data: {
        userId: ctx.user.id,
        type: "USAGE",
        amount: new Prisma.Decimal((-revenue).toFixed(6)),
        balance: new Prisma.Decimal(newBalance.toFixed(6)),
        description: `API usage: ${ctx.model.modelId}`,
        referenceId: ctx.requestId,
      },
    }),
    db.apiKey.update({
      where: { id: ctx.apiKey.id },
      data: {
        usedQuota: {
          increment: new Prisma.Decimal(revenue.toFixed(6)),
        },
      },
    }),
  ]);

  return { revenue, cost };
}
