import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { topupSchema } from "@/lib/validations";
import { processReferralCommission } from "@/lib/referral";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = topupSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "TOPUP_AMOUNT_INVALID";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const amount = Math.round(parsed.data.amount * 100) / 100;
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
      description: `TOPUP_DESC:${amount.toFixed(2)}`,
    },
  });

  // Referral commission
  await processReferralCommission(session.user.id, amount);

  return NextResponse.json({ success: true, balance: newBalance });
}
