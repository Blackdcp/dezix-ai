import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") || "20")));
  const search = url.searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { modelId: { contains: search, mode: "insensitive" } },
      { displayName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [models, total] = await Promise.all([
    db.model.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.model.count({ where }),
  ]);

  return NextResponse.json({
    models: models.map((m) => ({
      ...m,
      inputPrice: Number(m.inputPrice),
      outputPrice: Number(m.outputPrice),
      sellPrice: Number(m.sellPrice),
      sellOutPrice: Number(m.sellOutPrice),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  if (!body || !body.modelId || !body.displayName || !body.providerId) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  // Check modelId uniqueness
  const existing = await db.model.findUnique({ where: { modelId: body.modelId } });
  if (existing) {
    return NextResponse.json({ error: "模型 ID 已存在" }, { status: 409 });
  }

  const model = await db.model.create({
    data: {
      modelId: body.modelId,
      displayName: body.displayName,
      providerId: body.providerId,
      category: body.category || "chat",
      inputPrice: body.inputPrice ?? 0,
      outputPrice: body.outputPrice ?? 0,
      sellPrice: body.sellPrice ?? 0,
      sellOutPrice: body.sellOutPrice ?? 0,
      maxContext: body.maxContext ?? 4096,
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json({
    ...model,
    inputPrice: Number(model.inputPrice),
    outputPrice: Number(model.outputPrice),
    sellPrice: Number(model.sellPrice),
    sellOutPrice: Number(model.sellOutPrice),
  }, { status: 201 });
}
