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

  // Atomic: only update if PENDING — prevents double approval
  const result = await db.$executeRaw`
    UPDATE topup_orders
    SET status = 'APPROVED',
        "adminId" = ${session!.user.id},
        "updatedAt" = NOW()
    WHERE id = ${id} AND status = 'PENDING'
  `;

  if (result === 0) {
    return NextResponse.json(
      { error: "ORDER_NOT_PENDING" },
      { status: 400 }
    );
  }

  // Fetch the order to get amount and userId
  const order = await db.topupOrder.findUnique({
    where: { id },
    select: { userId: true, amount: true },
  });

  if (!order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  const amount = Number(order.amount);
  const amountDecimal = new Prisma.Decimal(amount.toFixed(6));

  // Add balance to user
  await db.$executeRaw`
    UPDATE users
    SET balance = balance + ${amountDecimal}::decimal,
        "updatedAt" = NOW()
    WHERE id = ${order.userId}
  `;

  // Read new balance
  const updatedUser = await db.user.findUnique({
    where: { id: order.userId },
    select: { balance: true },
  });
  const newBalance = updatedUser ? Number(updatedUser.balance) : 0;

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
