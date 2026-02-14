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

  if (body.displayName !== undefined) updateData.displayName = body.displayName;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.inputPrice !== undefined) updateData.inputPrice = body.inputPrice;
  if (body.outputPrice !== undefined) updateData.outputPrice = body.outputPrice;
  if (body.sellPrice !== undefined) updateData.sellPrice = body.sellPrice;
  if (body.sellOutPrice !== undefined) updateData.sellOutPrice = body.sellOutPrice;
  if (body.maxContext !== undefined) updateData.maxContext = body.maxContext;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  const model = await db.model.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    ...model,
    inputPrice: Number(model.inputPrice),
    outputPrice: Number(model.outputPrice),
    sellPrice: Number(model.sellPrice),
    sellOutPrice: Number(model.sellOutPrice),
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  await db.model.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
