import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.amount !== "number" || body.amount <= 0 || body.amount > 10000) {
    return NextResponse.json(
      { error: "金额必须在 0.01 ~ 10000 之间" },
      { status: 400 }
    );
  }

  const amount = Math.round(body.amount * 100) / 100; // Round to 2 decimal places
  const amountDecimal = new Prisma.Decimal(amount.toFixed(6));

  // Atomic balance addition
  await db.$executeRaw`
    UPDATE users
    SET balance = balance + ${amountDecimal}::decimal,
        "updatedAt" = NOW()
    WHERE id = ${session.user.id}
  `;

  // Read new balance
  const updatedUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true },
  });
  const newBalance = updatedUser ? Number(updatedUser.balance) : 0;

  // Create transaction record
  await db.transaction.create({
    data: {
      userId: session.user.id,
      type: "TOPUP",
      amount: amountDecimal,
      balance: new Prisma.Decimal(newBalance.toFixed(6)),
      description: `模拟充值 ¥${amount.toFixed(2)}`,
    },
  });

  return NextResponse.json({ success: true, balance: newBalance });
}
