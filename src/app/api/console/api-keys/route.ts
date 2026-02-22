import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { createApiKeySchema } from "@/lib/validations";

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
      keyEncrypted: true,
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
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      fullKey: k.keyEncrypted ? decrypt(k.keyEncrypted) : null,
      isActive: k.isActive,
      expiresAt: k.expiresAt,
      totalQuota: k.totalQuota ? Number(k.totalQuota) : null,
      usedQuota: Number(k.usedQuota),
      modelWhitelist: k.modelWhitelist,
      rateLimit: k.rateLimit,
      createdAt: k.createdAt,
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createApiKeySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "INVALID_PARAMS";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Generate key: sk-dezix-{48 random hex chars}
  const rawKey = `sk-dezix-${randomBytes(24).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = `${rawKey.slice(0, 14)}...${rawKey.slice(-4)}`;
  const keyEncrypted = encrypt(rawKey);

  const apiKey = await db.apiKey.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      keyHash,
      keyEncrypted,
      keyPrefix,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      totalQuota: parsed.data.totalQuota ?? null,
      modelWhitelist: parsed.data.modelWhitelist ?? [],
      rateLimit: parsed.data.rateLimit ?? null,
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
