import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await db.apiKey.findMany({
    where: { userId: session.user.id },
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
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    keys.map((k) => ({
      ...k,
      totalQuota: k.totalQuota ? Number(k.totalQuota) : null,
      usedQuota: Number(k.usedQuota),
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.name) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  // Generate key: sk-dezix-{48 random hex chars}
  const rawKey = `sk-dezix-${randomBytes(24).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = `${rawKey.slice(0, 14)}...${rawKey.slice(-4)}`;

  const apiKey = await db.apiKey.create({
    data: {
      userId: session.user.id,
      name: body.name,
      keyHash,
      keyPrefix,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      totalQuota: body.totalQuota ?? null,
      modelWhitelist: body.modelWhitelist ?? [],
      rateLimit: body.rateLimit ?? null,
    },
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

  return NextResponse.json({
    ...apiKey,
    totalQuota: apiKey.totalQuota ? Number(apiKey.totalQuota) : null,
    usedQuota: Number(apiKey.usedQuota),
    key: rawKey, // one-time reveal
  });
}
