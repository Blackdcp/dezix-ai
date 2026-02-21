import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { adminChannelsQuerySchema, adminCreateChannelSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(req.url);
  const parsed = adminChannelsQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });
  const { page, pageSize } = parsed.success
    ? parsed.data
    : { page: 1, pageSize: 20 };

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
  const parsed = adminCreateChannelSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "缺少必填字段";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const channel = await db.channel.create({
    data: {
      providerId: parsed.data.providerId,
      name: parsed.data.name,
      apiKey: encrypt(parsed.data.apiKey),
      baseUrl: parsed.data.baseUrl || null,
      priority: parsed.data.priority,
      weight: parsed.data.weight,
      isActive: parsed.data.isActive,
      models: parsed.data.models,
    },
    include: { provider: { select: { name: true } } },
  });

  return NextResponse.json({
    ...channel,
    apiKey: channel.apiKey.slice(0, 4) + "****" + channel.apiKey.slice(-4),
  }, { status: 201 });
}
