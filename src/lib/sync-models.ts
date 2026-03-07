import { db } from "@/lib/db";
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

// ============================================================
// Sufy page scraping — extract model IDs from HTML
// ============================================================

/** Known model ID patterns that appear on the Sufy page */
const MODEL_ID_PATTERNS: RegExp[] = [
  /openai\/[\w.-]+/g,
  /gpt-oss-[\w]+/g,
  /sora-[\w.-]+/g,
  /claude-\d[\w.-]*/g,
  /gemini-\d[\w.-]*/g,
  /veo-\d[\w.-]*/g,
  /deepseek-[\w.-]+/g,
  /x-ai\/[\w.-]+/g,
  /doubao-[\w.-]+/g,
  /qwen[\d][\w.-]*/g,
  /qwen-[\w.-]+/g,
  /z-ai\/[\w.-]+/g,
  /glm-\d[\w.-]*/g,
  /moonshotai\/[\w.-]+/g,
  /kimi-[\w.-]+/g,
  /minimax\/[\w.-]+/g,
  /minimax-[\w]+/g,
  /kling-[\w.-]+/g,
  /viduq?\d[\w.-]*/g,
  /xiaomi\/[\w.-]+/g,
  /meituan\/[\w.-]+/g,
  /stepfun\/[\w.-]+/g,
  /arcee-ai\/[\w.-]+/g,
];

/** IDs to exclude — CSS classes, HTML fragments, false positives */
const EXCLUDE_IDS = new Set([
  "qwen", "minimax", "deepseek", "kimi",
]);

/**
 * Fetch model IDs from the Sufy models page.
 * Scrapes https://sufy.com/services/ai-inference/models and extracts
 * model IDs from the embedded Next.js RSC payload.
 */
export async function fetchSufyModels(): Promise<string[]> {
  const url = "https://sufy.com/services/ai-inference/models";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DezixAI/1.0)",
      "Accept": "text/html",
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    throw new Error(`Sufy page returned ${res.status}: ${res.statusText}`);
  }

  const html = await res.text();
  const modelIds = new Set<string>();

  // Extract model IDs using known patterns
  for (const pattern of MODEL_ID_PATTERNS) {
    // Reset regex state for global patterns
    pattern.lastIndex = 0;
    const matches = html.matchAll(new RegExp(pattern.source, "g"));
    for (const match of matches) {
      const id = match[0];
      // Filter out obvious false positives
      if (id.length >= 3 && id.length < 60 && !EXCLUDE_IDS.has(id)) {
        modelIds.add(id);
      }
    }
  }

  // Also check for "asr" and "tts" specifically (simple IDs)
  if (html.includes('"asr"') || html.includes("'asr'")) modelIds.add("asr");
  if (html.includes('"tts"') || html.includes("'tts'")) modelIds.add("tts");

  if (modelIds.size === 0) {
    throw new Error("No models found on Sufy page — page structure may have changed");
  }

  return [...modelIds].sort();
}

// ============================================================
// Model defaults inference
// ============================================================

function inferDisplayName(modelId: string): string {
  const slashIdx = modelId.indexOf("/");
  const raw = slashIdx > 0 ? modelId.slice(slashIdx + 1) : modelId;

  return raw
    .split("-")
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join(" ");
}

function inferCategory(modelId: string): string {
  const lower = modelId.toLowerCase();
  if (/sora-|veo-|kling-(?!image)|viduq?/.test(lower)) return "video";
  if (/kling-image/.test(lower)) return "image";
  if (/^asr$|^tts$/.test(lower)) return "audio";
  if (/-vl-|vision|-image/.test(lower)) {
    if (/-image/.test(lower)) return "image";
    return "multimodal";
  }
  if (/-thinking|-r1|reasoning/.test(lower)) return "reasoning";
  if (/-code|-codex|coder/.test(lower)) return "code";
  return "chat";
}

function inferPricingTier(modelId: string): PricingTier {
  const brand = getModelBrand(modelId);
  const lower = modelId.toLowerCase();

  // Video models
  if (["video", "image"].includes(inferCategory(modelId))) {
    if (brand === "OpenAI") return "t5";
    if (lower.includes("pro") || lower.includes("3.1") || lower.includes("v3")) return "t4";
    if (lower.includes("turbo") || lower.includes("v1")) return "t1";
    return "t3";
  }

  // Premium/flagship brands
  if (brand === "OpenAI" || brand === "Anthropic") {
    if (lower.includes("nano")) return "t2";
    if (lower.includes("mini")) return "t3";
    if (lower.includes("haiku")) return "t2";
    if (lower.includes("sonnet")) return "t4";
    return "t5";
  }
  if (brand === "xAI") return "t4";
  if (brand === "Google") {
    if (lower.includes("pro")) return "t4";
    if (lower.includes("flash-lite")) return "t1";
    return "t2";
  }

  // Check for specific keywords that suggest higher tier
  if (lower.includes("max") || lower.includes("pro")) return "t3";
  if (lower.includes("235b") || lower.includes("480b") || lower.includes("397b")) return "t4";

  // Budget models
  if (lower.includes("lite") || lower.includes("mini") || lower.includes("flash")) return "t1";
  if (lower.includes("turbo") || lower.includes("7b")) return "t1";

  // Standard domestic models
  return "t2";
}

function inferMaxContext(modelId: string): number {
  const brand = getModelBrand(modelId);
  const category = inferCategory(modelId);
  if (["video", "image", "audio"].includes(category)) return 0;
  if (brand === "Google") return 1000000;
  if (brand === "Anthropic") return 200000;
  if (brand === "OpenAI" || brand === "xAI" || brand === "Arcee") return 128000;
  if (brand === "Zhipu" || brand === "Moonshot") return 128000;
  if (brand === "MiniMax" || brand === "DeepSeek") return 64000;
  return 32000;
}

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

// ============================================================
// Sync orchestrator
// ============================================================

/**
 * Sync models from the Sufy page.
 * - Fetches model list by scraping the Sufy models page
 * - Compares with ALL models in DB for this provider
 * - Creates new models, deactivates removed ones
 * - Updates channel model lists
 *
 * @param dryRun If true, only returns diff without making changes
 */
export async function syncUpstreamModels(
  providerId: string,
  dryRun = false
): Promise<SyncResult> {
  // 1. Fetch model list from Sufy page
  const upstreamIds = await fetchSufyModels();

  // 2. Get ALL current models in DB for this provider
  const dbModels = await db.model.findMany({
    where: { providerId },
    select: { modelId: true, isActive: true },
  });

  const dbModelIds = new Set(dbModels.map((m) => m.modelId));
  const upstreamSet = new Set(upstreamIds);

  // 3. Find new models (Sufy has, DB doesn't)
  const added: string[] = [];
  for (const id of upstreamIds) {
    if (!dbModelIds.has(id)) {
      added.push(id);
    }
  }

  // 4. Find deactivated models (DB has active, Sufy doesn't)
  const deactivated: string[] = [];
  for (const m of dbModels) {
    if (m.isActive && !upstreamSet.has(m.modelId)) {
      deactivated.push(m.modelId);
    }
  }

  if (dryRun) {
    return { added, deactivated, total: upstreamIds.length };
  }

  // 5. Create new models
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

  // 6. Deactivate removed models
  if (deactivated.length > 0) {
    await db.model.updateMany({
      where: { modelId: { in: deactivated }, providerId },
      data: { isActive: false },
    });
  }

  // 7. Re-activate models that were previously deactivated but are now back
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

  // 8. Update channel models list = all active models for this provider
  const allActiveModels = await db.model.findMany({
    where: { providerId, isActive: true },
    select: { modelId: true },
  });
  const allModelIds = allActiveModels.map((m) => m.modelId);

  await db.channel.updateMany({
    where: { providerId, isActive: true },
    data: { models: allModelIds },
  });

  return { added, deactivated, total: upstreamIds.length };
}
