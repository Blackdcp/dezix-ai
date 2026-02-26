import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { processReferralCommission } from "@/lib/referral";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  // Atomic: only update if PENDING and get order data in one query
  const pendingOrders = await db.$queryRaw<{ userId: string; amount: Prisma.Decimal }[]>`
    UPDATE topup_orders
    SET status = 'APPROVED',
        "adminId" = ${session!.user.id},
        "updatedAt" = NOW()
    WHERE id = ${id} AND status = 'PENDING'
    RETURNING "userId", amount
  `;

  if (pendingOrders.length === 0) {
    return NextResponse.json(
      { error: "ORDER_NOT_PENDING" },
      { status: 400 }
    );
  }

  const order = pendingOrders[0];
  const amount = Number(order.amount);
  const amountDecimal = new Prisma.Decimal(amount.toFixed(6));

  // Atomic: add balance and get new value in one query
  const rows = await db.$queryRaw<{ balance: Prisma.Decimal }[]>`
    UPDATE users
    SET balance = balance + ${amountDecimal}::decimal,
        "updatedAt" = NOW()
    WHERE id = ${order.userId}
    RETURNING balance
  `;

  const newBalance = rows.length > 0 ? Number(rows[0].balance) : 0;

  // Create transaction record
  await db.transaction.create({
    data: {
      userId: order.userId,
      type: "TOPUP",
      amount: amountDecimal,
      balance: new Prisma.Decimal(newBalance.toFixed(6)),
      description: `TOPUP_DESC:${amount.toFixed(2)}`,
      referenceId: id,
    },
  });

  // Referral commission
  await processReferralCommission(order.userId, amount);

  return NextResponse.json({ success: true });
}
