import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { decrypt } from "@/lib/encryption";
import { noAvailableChannelError } from "./errors";

interface ChannelInfo {
  id: string;
  providerId: string;
  providerName: string;
  apiKey: string;
  baseUrl: string;
  priority: number;
  weight: number;
}

const CHANNEL_CACHE_TTL = 30; // seconds

/**
 * Select a channel for the given model.
 *
 * Algorithm:
 * 1. Get all active channels that support the requested model
 * 2. Exclude any channels in the failedChannelIds set
 * 3. Group by priority (descending)
 * 4. Within the highest priority group, weighted random selection
 * 5. Channel list is cached in Redis for 30s
 */
export async function selectChannel(
  modelId: string,
  failedChannelIds: Set<string> = new Set()
): Promise<ChannelInfo> {
  const channels = await getChannelsForModel(modelId);

  // Filter out failed channels
  const available = channels.filter((ch) => !failedChannelIds.has(ch.id));
  if (available.length === 0) {
    throw noAvailableChannelError(modelId);
  }

  // Sort by priority descending
  available.sort((a, b) => b.priority - a.priority);

  // Get the highest priority group
  const maxPriority = available[0].priority;
  const topGroup = available.filter((ch) => ch.priority === maxPriority);

  // Weighted random selection within the top group
  return weightedRandom(topGroup);
}

async function getChannelsForModel(modelId: string): Promise<ChannelInfo[]> {
  const cacheKey = `channels:${modelId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const channels = await db.channel.findMany({
    where: {
      isActive: true,
      models: { has: modelId },
      provider: { isActive: true },
    },
    include: {
      provider: { select: { name: true, baseUrl: true } },
    },
  });

  const result: ChannelInfo[] = channels.map((ch) => ({
    id: ch.id,
    providerId: ch.providerId,
    providerName: ch.provider.name,
    apiKey: decrypt(ch.apiKey),
    baseUrl: ch.baseUrl || ch.provider.baseUrl,
    priority: ch.priority,
    weight: ch.weight,
  }));

  if (result.length > 0) {
    await redis.set(cacheKey, JSON.stringify(result), "EX", CHANNEL_CACHE_TTL);
  }

  return result;
}

function weightedRandom(channels: ChannelInfo[]): ChannelInfo {
  if (channels.length === 1) return channels[0];

  const totalWeight = channels.reduce((sum, ch) => sum + ch.weight, 0);
  let random = Math.random() * totalWeight;

  for (const ch of channels) {
    random -= ch.weight;
    if (random <= 0) return ch;
  }

  // Fallback (shouldn't reach here)
  return channels[0];
}
