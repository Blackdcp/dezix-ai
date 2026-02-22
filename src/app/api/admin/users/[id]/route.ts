import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { adminUpdateUserSchema } from "@/lib/validations";

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
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
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
  const parsed = adminUpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "INVALID_REQUEST";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.role !== undefined) updateData.role = parsed.data.role;

  const user = await db.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, balance: true },
  });

  return NextResponse.json({ ...user, balance: Number(user.balance) });
}
