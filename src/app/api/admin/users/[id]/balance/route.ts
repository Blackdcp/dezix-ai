import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { adminAdjustBalanceSchema } from "@/lib/validations";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = adminAdjustBalanceSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "AMOUNT_NOT_ZERO";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const amount = Math.round(parsed.data.amount * 100) / 100;
  const amountDecimal = new Prisma.Decimal(amount.toFixed(6));
  const description = parsed.data.description || `ADMIN_BALANCE_DESC:${amount > 0 ? "+" : ""}${amount.toFixed(2)}`;

  // Atomic balance update
  await db.$executeRaw`
    UPDATE users
    SET balance = balance + ${amountDecimal}::decimal,
        "updatedAt" = NOW()
    WHERE id = ${id}
  `;

  // Read new balance
  const updatedUser = await db.user.findUnique({
    where: { id },
    select: { balance: true },
  });

  if (!updatedUser) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  const newBalance = Number(updatedUser.balance);

  // Create ADMIN transaction
  await db.transaction.create({
    data: {
      userId: id,
      type: "ADMIN",
      amount: amountDecimal,
      balance: new Prisma.Decimal(newBalance.toFixed(6)),
      description,
      referenceId: `admin:${session!.user.id}`,
    },
  });

  return NextResponse.json({ success: true, balance: newBalance });
}
