import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
    },
    orderBy: { displayName: "asc" },
  });

  const providers = await db.provider.findMany({
    select: { id: true, name: true },
  });
  const providerMap = new Map(providers.map((p) => [p.id, p.name]));

  const allModels = await db.model.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ["category"],
  });
  const categories = allModels.map((m) => m.category);

  return NextResponse.json(
    {
      models: models.map((m) => ({
        id: m.id,
        modelId: m.modelId,
        displayName: m.displayName,
        providerName: providerMap.get(m.providerId) || "Unknown",
        category: m.category,
        sellPrice: Number(m.sellPrice),
        sellOutPrice: Number(m.sellOutPrice),
        maxContext: m.maxContext,
      })),
      providers: providers.map((p) => ({ id: p.id, name: p.name })),
      categories,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
