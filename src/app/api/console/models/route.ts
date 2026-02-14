import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search")?.trim() || "";
  const category = searchParams.get("category") || "";
  const provider = searchParams.get("provider") || "";

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
  if (provider) {
    where.providerId = provider;
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

  // Query all providers to map providerId → name
  const providers = await db.provider.findMany({
    select: { id: true, name: true },
  });
  const providerMap = new Map(providers.map((p) => [p.id, p.name]));

  // Get distinct categories for filter options
  const allModels = await db.model.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  const categories = allModels.map((m) => m.category);

  return NextResponse.json({
    models: models.map((m) => ({
      id: m.id,
      modelId: m.modelId,
      displayName: m.displayName,
      providerName: providerMap.get(m.providerId) || "Unknown",
      providerId: m.providerId,
      category: m.category,
      sellPrice: Number(m.sellPrice),
      sellOutPrice: Number(m.sellOutPrice),
      maxContext: m.maxContext,
      isActive: m.isActive,
    })),
    providers: providers.map((p) => ({ id: p.id, name: p.name })),
    categories,
  });
}
