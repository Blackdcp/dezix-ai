import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { adminBatchPriceSchema } from "@/lib/validations";

/**
 * POST /api/admin/models/batch-price — Batch update model pricing
 * Two modes:
 *   1. Absolute: provide sellPrice/sellOutPrice/inputPrice/outputPrice directly
 *   2. Multiplier: provide multiplier, sellPrice = inputPrice × multiplier per model
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

  const { modelIds, sellPrice, sellOutPrice, inputPrice, outputPrice, multiplier } = parsed.data;

  // Multiplier mode: sell = cost × multiplier, per model individually
  if (multiplier !== undefined) {
    const models = await db.model.findMany({
      where: { id: { in: modelIds } },
      select: { id: true, inputPrice: true, outputPrice: true },
    });

    let updated = 0;
    for (const m of models) {
      const newSellPrice = new Prisma.Decimal(
        (Number(m.inputPrice) * multiplier).toFixed(8)
      );
      const newSellOutPrice = new Prisma.Decimal(
        (Number(m.outputPrice) * multiplier).toFixed(8)
      );
      await db.model.update({
        where: { id: m.id },
        data: { sellPrice: newSellPrice, sellOutPrice: newSellOutPrice },
      });
      updated++;
    }

    return NextResponse.json({ updated });
  }

  // Absolute mode: set fixed prices for all selected models
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
