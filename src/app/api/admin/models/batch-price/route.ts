import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { adminBatchPriceSchema } from "@/lib/validations";

/**
 * POST /api/admin/models/batch-price — Batch update model pricing
 */
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = adminBatchPriceSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "INVALID_INPUT";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { modelIds, sellPrice, sellOutPrice, inputPrice, outputPrice } = parsed.data;

  // Build update data — only include provided fields
  const updateData: Record<string, unknown> = {};
  if (sellPrice !== undefined) updateData.sellPrice = sellPrice;
  if (sellOutPrice !== undefined) updateData.sellOutPrice = sellOutPrice;
  if (inputPrice !== undefined) updateData.inputPrice = inputPrice;
  if (outputPrice !== undefined) updateData.outputPrice = outputPrice;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No price fields provided" }, { status: 400 });
  }

  const result = await db.model.updateMany({
    where: { id: { in: modelIds } },
    data: updateData,
  });

  return NextResponse.json({ updated: result.count });
}
