import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

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
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  if (body.expiresAt !== undefined)
    updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  if (body.totalQuota !== undefined) updateData.totalQuota = body.totalQuota;
  if (body.modelWhitelist !== undefined)
    updateData.modelWhitelist = body.modelWhitelist;
  if (body.rateLimit !== undefined) updateData.rateLimit = body.rateLimit;

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
