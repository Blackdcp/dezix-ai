import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getModelBrand, getBrandList } from "@/lib/brand";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search")?.trim() || "";
  const category = searchParams.get("category") || "";
  const providerBrand = searchParams.get("provider") || "";

  // Build where clause
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { displayName: { contains: search, mode: "insensitive" } },
      { modelId: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) {
    where.category = category;
  }

  // Query models
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
      isActive: true,
    },
    orderBy: { displayName: "asc" },
  });

  // Map models with brand names (hiding upstream provider)
  const mappedModels = models.map((m) => ({
    id: m.id,
    modelId: m.modelId,
    displayName: m.displayName,
    providerName: getModelBrand(m.modelId),
    providerId: m.providerId,
    category: m.category,
    sellPrice: Number(m.sellPrice),
    sellOutPrice: Number(m.sellOutPrice),
    maxContext: m.maxContext,
    isActive: m.isActive,
  }));

  // Filter by brand if specified
  const filteredModels = providerBrand
    ? mappedModels.filter((m) => m.providerName === providerBrand)
    : mappedModels;

  // Get distinct categories for filter options
  const allModels = await db.model.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  const categories = allModels.map((m) => m.category);

  // Build brand list from all model IDs
  const allModelIds = await db.model.findMany({
    select: { modelId: true },
  });
  const brands = getBrandList(allModelIds.map((m) => m.modelId));

  return NextResponse.json({
    models: filteredModels,
    providers: brands.map((b) => ({ id: b, name: b })),
    categories,
  });
}
