import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getModelBrand, getBrandList } from "@/lib/brand";
import { getModelMetadata } from "@/lib/model-metadata";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search")?.trim() || "";
  const category = searchParams.get("category") || "";

  const where: Record<string, unknown> = { isActive: true };
  if (search) {
    where.OR = [
      { displayName: { contains: search, mode: "insensitive" } },
      { modelId: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const models = await db.model.findMany({
    where,
    select: {
      id: true,
      modelId: true,
      displayName: true,
      providerId: true,
      category: true,
      sellPrice: true,
      sellOutPrice: true,
      maxContext: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const allModels = await db.model.findMany({
    where: { isActive: true },
    select: { category: true, modelId: true },
    distinct: ["category"],
  });
  const categories = allModels.map((m) => m.category);

  // Build brand list from all active model IDs
  const allActiveModels = await db.model.findMany({
    where: { isActive: true },
    select: { modelId: true },
  });
  const brands = getBrandList(allActiveModels.map((m) => m.modelId));

  return NextResponse.json(
    {
      models: models.map((m) => {
        const meta = getModelMetadata(m.modelId, m.category);
        return {
          id: m.id,
          modelId: m.modelId,
          displayName: m.displayName,
          providerName: getModelBrand(m.modelId),
          category: m.category,
          sellPrice: Number(m.sellPrice),
          sellOutPrice: Number(m.sellOutPrice),
          maxContext: m.maxContext,
          badges: meta.badges,
          features: meta.features,
          inputTypes: meta.inputTypes,
          outputTypes: meta.outputTypes,
          createdAt: m.createdAt.toISOString(),
        };
      }),
      providers: brands.map((b) => ({ id: b, name: b })),
      categories,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
