import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { adminUpdateModelSchema } from "@/lib/validations";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = adminUpdateModelSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "无效请求";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const model = await db.model.update({
    where: { id },
    data: parsed.data,
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
