import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { adminModelsQuerySchema, adminCreateModelSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const parsed = adminModelsQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
  });
  const { page, pageSize, search } = parsed.success
    ? parsed.data
    : { page: 1, pageSize: 20, search: "" };

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
      isManual: m.isManual,
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
  const parsed = adminCreateModelSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "MISSING_FIELDS";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Check modelId uniqueness
  const existing = await db.model.findUnique({ where: { modelId: parsed.data.modelId } });
  if (existing) {
    return NextResponse.json({ error: "MODEL_EXISTS" }, { status: 409 });
  }

  const model = await db.model.create({
    data: parsed.data,
  });

  return NextResponse.json({
    ...model,
    inputPrice: Number(model.inputPrice),
    outputPrice: Number(model.outputPrice),
    sellPrice: Number(model.sellPrice),
    sellOutPrice: Number(model.sellOutPrice),
  }, { status: 201 });
}
