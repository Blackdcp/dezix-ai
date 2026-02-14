import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      balance: true,
      referralCode: true,
      referredBy: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { apiKeys: true, usageLogs: true, transactions: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  return NextResponse.json({ ...user, balance: Number(user.balance) });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.role === "ADMIN" || body.role === "USER") updateData.role = body.role;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "没有可更新的字段" }, { status: 400 });
  }

  const user = await db.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, balance: true },
  });

  return NextResponse.json({ ...user, balance: Number(user.balance) });
}
