import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { updateApiKeySchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const existing = await db.apiKey.findUnique({
    where: { id },
    select: { userId: true, keyHash: true },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateApiKeySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "INVALID_PARAMS";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.name !== undefined) updateData.name = d.name;
  if (d.isActive !== undefined) updateData.isActive = d.isActive;
  if (d.expiresAt !== undefined)
    updateData.expiresAt = d.expiresAt ? new Date(d.expiresAt) : null;
  if (d.totalQuota !== undefined) updateData.totalQuota = d.totalQuota;
  if (d.modelWhitelist !== undefined)
    updateData.modelWhitelist = d.modelWhitelist;
  if (d.rateLimit !== undefined) updateData.rateLimit = d.rateLimit;

  const updated = await db.apiKey.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      isActive: true,
      expiresAt: true,
      totalQuota: true,
      usedQuota: true,
      modelWhitelist: true,
      rateLimit: true,
      createdAt: true,
    },
  });

  // Clear Redis cache for this key
  await redis.del(`apikey:${existing.keyHash}`);
  await redis.del(`apikey:whitelist:${id}`);

  return NextResponse.json({
    ...updated,
    totalQuota: updated.totalQuota ? Number(updated.totalQuota) : null,
    usedQuota: Number(updated.usedQuota),
  });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const existing = await db.apiKey.findUnique({
    where: { id },
    select: { userId: true, keyHash: true },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.apiKey.delete({ where: { id } });

  // Clear Redis cache
  await redis.del(`apikey:${existing.keyHash}`);
  await redis.del(`apikey:whitelist:${id}`);

  return NextResponse.json({ success: true });
}
