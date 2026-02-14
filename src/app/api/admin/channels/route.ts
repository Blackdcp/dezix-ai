import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") || "20")));

  const [channels, total] = await Promise.all([
    db.channel.findMany({
      include: { provider: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.channel.count(),
  ]);

  return NextResponse.json({
    channels: channels.map((c) => ({
      ...c,
      apiKey: c.apiKey.length > 8
        ? c.apiKey.slice(0, 4) + "****" + c.apiKey.slice(-4)
        : "****",
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
  if (!body || !body.providerId || !body.name || !body.apiKey) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  const channel = await db.channel.create({
    data: {
      providerId: body.providerId,
      name: body.name,
      apiKey: body.apiKey,
      baseUrl: body.baseUrl || null,
      priority: body.priority ?? 0,
      weight: body.weight ?? 1,
      isActive: body.isActive ?? true,
      models: body.models || [],
    },
    include: { provider: { select: { name: true } } },
  });

  return NextResponse.json({
    ...channel,
    apiKey: channel.apiKey.slice(0, 4) + "****" + channel.apiKey.slice(-4),
  }, { status: 201 });
}
