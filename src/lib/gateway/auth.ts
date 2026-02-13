import { createHash } from "crypto";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { authenticationError } from "./errors";
import type { GatewayContext } from "./types";

const KEY_CACHE_TTL = 60; // seconds

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Authenticate an API request by Bearer token.
 * 1. Extract token from Authorization header
 * 2. SHA-256 hash the token
 * 3. Look up keyHash in cache (Redis) or database
 * 4. Validate key is active, not expired, quota not exceeded
 * Returns partial GatewayContext with apiKey + user info.
 */
export async function authenticateRequest(
  authHeader: string | null
): Promise<Pick<GatewayContext, "apiKey" | "user">> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw authenticationError("Missing or invalid Authorization header");
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw authenticationError("Empty API key");
  }

  const keyHash = sha256(token);

  // Try Redis cache first
  const cacheKey = `apikey:${keyHash}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    const data = JSON.parse(cached);
    validateKeyData(data);
    return data;
  }

  // Query database
  const apiKey = await db.apiKey.findUnique({
    where: { keyHash },
    include: {
      user: {
        select: { id: true, balance: true },
      },
    },
  });

  if (!apiKey) {
    throw authenticationError();
  }

  const data: Pick<GatewayContext, "apiKey" | "user"> = {
    apiKey: {
      id: apiKey.id,
      userId: apiKey.userId,
      rateLimit: apiKey.rateLimit,
    },
    user: {
      id: apiKey.user.id,
      balance: Number(apiKey.user.balance),
    },
  };

  validateKeyData({
    ...data,
    isActive: apiKey.isActive,
    expiresAt: apiKey.expiresAt?.toISOString() ?? null,
    totalQuota: apiKey.totalQuota ? Number(apiKey.totalQuota) : null,
    usedQuota: Number(apiKey.usedQuota),
    modelWhitelist: apiKey.modelWhitelist,
  });

  // Cache the result (include validation fields)
  await redis.set(
    cacheKey,
    JSON.stringify({
      ...data,
      isActive: apiKey.isActive,
      expiresAt: apiKey.expiresAt?.toISOString() ?? null,
      totalQuota: apiKey.totalQuota ? Number(apiKey.totalQuota) : null,
      usedQuota: Number(apiKey.usedQuota),
      modelWhitelist: apiKey.modelWhitelist,
    }),
    "EX",
    KEY_CACHE_TTL
  );

  return data;
}

/**
 * Check the model whitelist for the given API key.
 * If modelWhitelist is empty, all models are allowed.
 */
export async function checkModelWhitelist(
  keyHash: string,
  modelId: string
): Promise<string[]> {
  // Read whitelist from the cache or DB
  const cacheKey = `apikey:${sha256("__bypass__")}`;
  // We actually read it from the cached auth data
  // This function is called after auth, so we re-read from cache
  const apiKey = await db.apiKey.findUnique({
    where: { keyHash },
    select: { modelWhitelist: true },
  });
  return apiKey?.modelWhitelist ?? [];
}

function validateKeyData(data: Record<string, unknown>) {
  if (data.isActive === false) {
    throw authenticationError("API key has been deactivated");
  }

  if (data.expiresAt && new Date(data.expiresAt as string) < new Date()) {
    throw authenticationError("API key has expired");
  }

  if (
    data.totalQuota != null &&
    (data.usedQuota as number) >= (data.totalQuota as number)
  ) {
    throw authenticationError("API key quota exceeded");
  }
}

/**
 * Get the model whitelist for a given API key ID.
 */
export async function getModelWhitelist(apiKeyId: string): Promise<string[]> {
  const cacheKey = `apikey:whitelist:${apiKeyId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const apiKey = await db.apiKey.findUnique({
    where: { id: apiKeyId },
    select: { modelWhitelist: true },
  });

  const whitelist = apiKey?.modelWhitelist ?? [];
  await redis.set(cacheKey, JSON.stringify(whitelist), "EX", KEY_CACHE_TTL);
  return whitelist;
}
