import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { adminUpdateChannelSchema } from "@/lib/validations";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = adminUpdateChannelSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "无效请求";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.name !== undefined) updateData.name = d.name;
  if (d.providerId !== undefined) updateData.providerId = d.providerId;
  if (d.baseUrl !== undefined) updateData.baseUrl = d.baseUrl || null;
  if (d.priority !== undefined) updateData.priority = d.priority;
  if (d.weight !== undefined) updateData.weight = d.weight;
  if (d.isActive !== undefined) updateData.isActive = d.isActive;
  if (d.models !== undefined) updateData.models = d.models;
  // Only update apiKey if non-empty value provided
  if (d.apiKey && d.apiKey.trim()) updateData.apiKey = encrypt(d.apiKey);

  const channel = await db.channel.update({
    where: { id },
    data: updateData,
    include: { provider: { select: { name: true } } },
  });

  return NextResponse.json({
    ...channel,
    apiKey: channel.apiKey.length > 8
      ? channel.apiKey.slice(0, 4) + "****" + channel.apiKey.slice(-4)
      : "****",
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  await db.channel.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
