import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
  const skip = (page - 1) * pageSize;

  const [user, transactions, total] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    }),
    db.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        type: true,
        amount: true,
        balance: true,
        description: true,
        createdAt: true,
      },
    }),
    db.transaction.count({
      where: { userId: session.user.id },
    }),
  ]);

  return NextResponse.json({
    balance: user ? Number(user.balance) : 0,
    transactions: transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
      balance: Number(t.balance),
    })),
    total,
    page,
    pageSize,
  });
}
