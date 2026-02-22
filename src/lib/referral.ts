import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Process referral commission for a topup.
 * If the user was referred by someone, give the referrer a commission.
 */
export async function processReferralCommission(
  userId: string,
  amount: number
): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { referredBy: true },
  });

  if (!user?.referredBy) return;

  try {
    const config = await db.systemConfig.findUnique({
      where: { key: "referral_commission_rate" },
    });
    const rate = config ? parseFloat(config.value) : 0.1;
    const commission = Math.round(amount * rate * 100) / 100;

    if (commission <= 0) return;

    const commissionDecimal = new Prisma.Decimal(commission.toFixed(6));

    // Add commission to referrer's balance
    await db.$executeRaw`
      UPDATE users
      SET balance = balance + ${commissionDecimal}::decimal,
          "updatedAt" = NOW()
      WHERE id = ${user.referredBy}
    `;

    const referrer = await db.user.findUnique({
      where: { id: user.referredBy },
      select: { balance: true },
    });
    const referrerBalance = referrer ? Number(referrer.balance) : 0;

    await db.transaction.create({
      data: {
        userId: user.referredBy,
        type: "REFERRAL",
        amount: commissionDecimal,
        balance: new Prisma.Decimal(referrerBalance.toFixed(6)),
        description: `REFERRAL_DESC:${commission.toFixed(2)}:${(rate * 100).toFixed(0)}`,
        referenceId: userId,
      },
    });

    await db.referralReward.create({
      data: {
        userId: user.referredBy,
        fromUserId: userId,
        amount: commissionDecimal,
      },
    });
  } catch {
    // Don't fail the topup if referral commission fails
  }
}
