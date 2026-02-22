import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { getModelBrand } from "@/lib/brand";

// Pricing tiers (per 1K tokens) — same as seed.ts
const PRICING_TIERS = {
  t1: { inputPrice: "0.0005", outputPrice: "0.0015", sellPrice: "0.001", sellOutPrice: "0.003" },
  t2: { inputPrice: "0.0010", outputPrice: "0.0040", sellPrice: "0.002", sellOutPrice: "0.006" },
  t3: { inputPrice: "0.0020", outputPrice: "0.0060", sellPrice: "0.003", sellOutPrice: "0.009" },
  t4: { inputPrice: "0.0050", outputPrice: "0.0150", sellPrice: "0.008", sellOutPrice: "0.022" },
  t5: { inputPrice: "0.0100", outputPrice: "0.0300", sellPrice: "0.015", sellOutPrice: "0.045" },
} as const;

type PricingTier = keyof typeof PRICING_TIERS;

interface UpstreamModel {
  id: string;
  object?: string;
  created?: number;
  owned_by?: string;
}

export interface ModelDefaults {
  displayName: string;
  category: string;
  maxContext: number;
  inputPrice: string;
  outputPrice: string;
  sellPrice: string;
  sellOutPrice: string;
}

export interface SyncResult {
  added: string[];
  deactivated: string[];
  total: number;
}

/**
 * Fetch upstream model list from /v1/models endpoint
 */
export async function fetchUpstreamModels(apiKey: string, baseUrl: string): Promise<string[]> {
  const url = `${baseUrl.replace(/\/$/, "")}/models`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Upstream API returned ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const models: UpstreamModel[] = data.data || [];
  return models.map((m) => m.id).filter(Boolean);
}

/**
 * Infer display name from modelId:
 * - Remove vendor prefix (e.g., "deepseek/" or "openai/")
 * - Capitalize first letters of segments
 */
function inferDisplayName(modelId: string): string {
  // Remove prefix like "vendor/"
  const slashIdx = modelId.indexOf("/");
  const raw = slashIdx > 0 ? modelId.slice(slashIdx + 1) : modelId;

  // Split by hyphens and capitalize
  return raw
    .split("-")
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join(" ");
}

/**
 * Infer category from modelId keywords
 */
function inferCategory(modelId: string): string {
  const lower = modelId.toLowerCase();
  if (/-vl-|vision|vl-/.test(lower)) return "multimodal";
  if (/-thinking|-r1|thinking/.test(lower)) return "reasoning";
  if (/-code|-codex|coder/.test(lower)) return "code";
  if (/-image/.test(lower)) return "image";
  return "chat";
}

/**
 * Infer pricing tier based on brand
 */
function inferPricingTier(modelId: string): PricingTier {
  const brand = getModelBrand(modelId);
  const lower = modelId.toLowerCase();

  // Premium/flagship brands
  if (brand === "OpenAI" || brand === "Anthropic" || brand === "xAI") return "t4";
  if (brand === "Google") {
    if (lower.includes("pro")) return "t4";
    return "t2";
  }

  // Check for specific keywords that suggest higher tier
  if (lower.includes("max") || lower.includes("pro")) return "t3";
  if (lower.includes("235b") || lower.includes("480b")) return "t3";

  // Budget models
  if (lower.includes("lite") || lower.includes("mini") || lower.includes("flash")) return "t1";
  if (lower.includes("turbo") || lower.includes("7b")) return "t1";

  // Standard domestic models
  return "t2";
}

/**
 * Infer max context from modelId keywords
 */
function inferMaxContext(modelId: string): number {
  const brand = getModelBrand(modelId);
  if (brand === "Google") return 1000000;
  if (brand === "Anthropic") return 200000;
  if (brand === "OpenAI" || brand === "xAI") return 128000;
  if (brand === "智谱 AI") return 128000;
  if (brand === "月之暗面") return 128000;
  if (brand === "MiniMax") return 64000;
  if (brand === "DeepSeek") return 64000;
  return 32000;
}

/**
 * Infer all default attributes for a new model
 */
export function inferModelDefaults(modelId: string): ModelDefaults {
  const tier = inferPricingTier(modelId);
  const pricing = PRICING_TIERS[tier];

  return {
    displayName: inferDisplayName(modelId),
    category: inferCategory(modelId),
    maxContext: inferMaxContext(modelId),
    ...pricing,
  };
}

/**
 * Sync upstream models for a given provider.
 * - Fetches model list from upstream API
 * - Compares with DB (isManual=false models only)
 * - Creates new models, deactivates removed ones
 * - Updates channel model lists
 *
 * @param dryRun If true, only returns diff without making changes
 */
export async function syncUpstreamModels(
  providerId: string,
  dryRun = false
): Promise<SyncResult> {
  // 1. Find active channel for this provider
  const channel = await db.channel.findFirst({
    where: { providerId, isActive: true },
    orderBy: { priority: "desc" },
  });

  if (!channel) {
    throw new Error("No active channel found for this provider");
  }

  // 2. Get provider baseUrl
  const provider = await db.provider.findUnique({ where: { id: providerId } });
  if (!provider) {
    throw new Error("Provider not found");
  }

  // 3. Decrypt API key and fetch upstream models
  const apiKey = decrypt(channel.apiKey);
  const baseUrl = channel.baseUrl || provider.baseUrl;
  const upstreamIds = await fetchUpstreamModels(apiKey, baseUrl);

  // 4. Get current non-manual models in DB
  const dbModels = await db.model.findMany({
    where: { providerId, isManual: false },
    select: { modelId: true, isActive: true },
  });

  const dbModelIds = new Set(dbModels.map((m) => m.modelId));
  const upstreamSet = new Set(upstreamIds);

  // 5. Find new models (upstream has, DB doesn't)
  const added: string[] = [];
  for (const id of upstreamIds) {
    if (!dbModelIds.has(id)) {
      added.push(id);
    }
  }

  // 6. Find deactivated models (DB has active, upstream doesn't)
  const deactivated: string[] = [];
  for (const m of dbModels) {
    if (m.isActive && !upstreamSet.has(m.modelId)) {
      deactivated.push(m.modelId);
    }
  }

  if (dryRun) {
    return { added, deactivated, total: upstreamIds.length };
  }

  // 7. Create new models
  for (const modelId of added) {
    const defaults = inferModelDefaults(modelId);
    await db.model.create({
      data: {
        modelId,
        displayName: defaults.displayName,
        providerId,
        category: defaults.category,
        inputPrice: defaults.inputPrice,
        outputPrice: defaults.outputPrice,
        sellPrice: defaults.sellPrice,
        sellOutPrice: defaults.sellOutPrice,
        maxContext: defaults.maxContext,
        isActive: true,
        isManual: false,
      },
    });
  }

  // 8. Deactivate removed models
  if (deactivated.length > 0) {
    await db.model.updateMany({
      where: { modelId: { in: deactivated }, providerId },
      data: { isActive: false },
    });
  }

  // 9. Re-activate models that were previously deactivated but are now back
  const reactivateIds: string[] = [];
  for (const m of dbModels) {
    if (!m.isActive && upstreamSet.has(m.modelId)) {
      reactivateIds.push(m.modelId);
    }
  }
  if (reactivateIds.length > 0) {
    await db.model.updateMany({
      where: { modelId: { in: reactivateIds }, providerId },
      data: { isActive: true },
    });
  }

  // 10. Update channel models list = all active models for this provider
  const allActiveModels = await db.model.findMany({
    where: { providerId, isActive: true },
    select: { modelId: true },
  });
  const allModelIds = allActiveModels.map((m) => m.modelId);

  // Update all active channels for this provider
  await db.channel.updateMany({
    where: { providerId, isActive: true },
    data: { models: allModelIds },
  });

  return { added, deactivated, total: upstreamIds.length };
}
