import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { createTopupOrderSchema } from "@/lib/validations";

// GET — user's topup orders
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "10")));
  const skip = (page - 1) * pageSize;

  const [orders, total] = await Promise.all([
    db.topupOrder.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.topupOrder.count({
      where: { userId: session.user.id },
    }),
  ]);

  return NextResponse.json({
    orders: orders.map((o) => ({
      ...o,
      amount: Number(o.amount),
    })),
    total,
    page,
    pageSize,
  });
}

// POST — create topup order
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createTopupOrderSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "TOPUP_AMOUNT_INVALID";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const amount = Math.round(parsed.data.amount * 100) / 100;

  const order = await db.topupOrder.create({
    data: {
      userId: session.user.id,
      amount: new Prisma.Decimal(amount.toFixed(6)),
      remark: parsed.data.remark || null,
    },
  });

  return NextResponse.json({
    success: true,
    order: { ...order, amount: Number(order.amount) },
  });
}
