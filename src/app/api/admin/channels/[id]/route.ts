import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

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
  if (body.providerId !== undefined) updateData.providerId = body.providerId;
  if (body.baseUrl !== undefined) updateData.baseUrl = body.baseUrl || null;
  if (body.priority !== undefined) updateData.priority = body.priority;
  if (body.weight !== undefined) updateData.weight = body.weight;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  if (body.models !== undefined) updateData.models = body.models;
  // Only update apiKey if non-empty value provided
  if (body.apiKey && body.apiKey.trim()) updateData.apiKey = body.apiKey;

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
