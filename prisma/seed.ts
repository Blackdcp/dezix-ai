import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createCipheriv, randomBytes } from "crypto";

function encryptApiKey(plaintext: string): string {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    console.warn("  ⚠️ ENCRYPTION_KEY not set, storing API key as plaintext");
    return plaintext;
  }
  const key = Buffer.from(hex, "hex");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv, { authTagLength: 16 });
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${encrypted.toString("base64")}:${authTag.toString("base64")}`;
}

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://dezix:dezix_password@localhost:5432/dezix?schema=public",
  ssl: process.env.DATABASE_URL?.includes("supabase")
    ? { rejectUnauthorized: false }
    : undefined,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database — synced from Sufy (sufy.com/services/ai-inference/models)...");

  // --- Step 1: Deactivate old providers & channels ---
  const oldProviders = ["openai", "anthropic", "google", "deepseek"];
  for (const name of oldProviders) {
    await prisma.provider.updateMany({
      where: { name },
      data: { isActive: false },
    });
  }
  await prisma.channel.updateMany({
    where: {
      provider: { name: { in: oldProviders } },
    },
    data: { isActive: false },
  });
  console.log("  ✅ Old providers & channels deactivated");

  // --- Step 2: Deactivate old models ---
  await prisma.model.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });
  console.log("  ✅ Old models deactivated");

  // --- Step 3: Create Qiniu provider ---
  const qiniuProvider = await prisma.provider.upsert({
    where: { name: "qiniu" },
    update: { baseUrl: "https://api.qnaigc.com/v1", isActive: true },
    create: {
      name: "qiniu",
      baseUrl: "https://api.qnaigc.com/v1",
      isActive: true,
    },
  });
  console.log(`  ✅ Provider: qiniu (${qiniuProvider.id})`);

  // --- Step 4: Create all models from Sufy platform ---
  // Synced from: https://sufy.com/services/ai-inference/models
  // Last sync: 2026-03-07
  //
  // Pricing tiers (per 1K tokens) — placeholder until real cost confirmed:
  const t1 = { inputPrice: "0.0005", outputPrice: "0.0015", sellPrice: "0.001", sellOutPrice: "0.003" }; // budget
  const t2 = { inputPrice: "0.0010", outputPrice: "0.0040", sellPrice: "0.002", sellOutPrice: "0.006" }; // standard
  const t3 = { inputPrice: "0.0020", outputPrice: "0.0060", sellPrice: "0.003", sellOutPrice: "0.009" }; // premium
  const t4 = { inputPrice: "0.0050", outputPrice: "0.0150", sellPrice: "0.008", sellOutPrice: "0.022" }; // flagship
  const t5 = { inputPrice: "0.0100", outputPrice: "0.0300", sellPrice: "0.015", sellOutPrice: "0.045" }; // ultra

  type ModelDef = {
    modelId: string; displayName: string; category: string; maxContext: number;
    inputPrice: string; outputPrice: string; sellPrice: string; sellOutPrice: string;
  };

  const models: ModelDef[] = [
    // ==================== OpenAI (14) ====================
    { modelId: "openai/gpt-5.4",        displayName: "GPT-5.4",         category: "chat",   maxContext: 128000, ...t5 },
    { modelId: "openai/gpt-5-pro",       displayName: "GPT-5 Pro",       category: "chat",   maxContext: 128000, ...t5 },
    { modelId: "openai/gpt-5-chat",      displayName: "GPT-5 Chat",      category: "chat",   maxContext: 128000, ...t5 },
    { modelId: "openai/gpt-5.2-chat",    displayName: "GPT-5.2 Chat",    category: "chat",   maxContext: 128000, ...t5 },
    { modelId: "openai/gpt-5",           displayName: "GPT-5",           category: "chat",   maxContext: 128000, ...t5 },
    { modelId: "openai/gpt-5.2",         displayName: "GPT-5.2",         category: "chat",   maxContext: 128000, ...t5 },
    { modelId: "openai/gpt-5-mini",      displayName: "GPT-5 Mini",      category: "chat",   maxContext: 128000, ...t3 },
    { modelId: "openai/gpt-5-nano",      displayName: "GPT-5 Nano",      category: "chat",   maxContext: 128000, ...t2 },
    { modelId: "openai/gpt-5.2-codex",   displayName: "GPT-5.2 Codex",   category: "code",   maxContext: 128000, ...t5 },
    { modelId: "openai/gpt-5.3-codex",   displayName: "GPT-5.3 Codex",   category: "code",   maxContext: 128000, ...t5 },
    { modelId: "gpt-oss-20b",            displayName: "GPT-OSS 20B",     category: "chat",   maxContext: 128000, ...t2 },
    { modelId: "gpt-oss-120b",           displayName: "GPT-OSS 120B",    category: "chat",   maxContext: 128000, ...t3 },
    { modelId: "sora-2-pro",             displayName: "Sora 2 Pro",      category: "video",  maxContext: 0, ...t5 },
    { modelId: "sora-2",                 displayName: "Sora 2",          category: "video",  maxContext: 0, ...t4 },

    // ==================== Anthropic (8) ====================
    { modelId: "claude-4.6-opus",        displayName: "Claude 4.6 Opus",   category: "chat", maxContext: 200000, ...t5 },
    { modelId: "claude-4.6-sonnet",      displayName: "Claude 4.6 Sonnet", category: "chat", maxContext: 200000, ...t4 },
    { modelId: "claude-4.5-opus",        displayName: "Claude 4.5 Opus",   category: "chat", maxContext: 200000, ...t5 },
    { modelId: "claude-4.5-sonnet",      displayName: "Claude 4.5 Sonnet", category: "chat", maxContext: 200000, ...t4 },
    { modelId: "claude-4.5-haiku",       displayName: "Claude 4.5 Haiku",  category: "chat", maxContext: 200000, ...t2 },
    { modelId: "claude-4.1-opus",        displayName: "Claude 4.1 Opus",   category: "chat", maxContext: 200000, ...t5 },
    { modelId: "claude-4.0-opus",        displayName: "Claude 4.0 Opus",   category: "chat", maxContext: 200000, ...t5 },
    { modelId: "claude-4.0-sonnet",      displayName: "Claude 4.0 Sonnet", category: "chat", maxContext: 200000, ...t4 },

    // ==================== Google Gemini (10) ====================
    { modelId: "gemini-3.1-pro-preview",        displayName: "Gemini 3.1 Pro Preview",        category: "multimodal", maxContext: 1000000, ...t4 },
    { modelId: "gemini-3.1-flash-lite-preview",  displayName: "Gemini 3.1 Flash Lite Preview", category: "multimodal", maxContext: 1000000, ...t1 },
    { modelId: "gemini-3.1-flash-image-preview", displayName: "Gemini 3.1 Flash Image Preview", category: "image",    maxContext: 1000000, ...t2 },
    { modelId: "gemini-3.0-pro-preview",         displayName: "Gemini 3.0 Pro Preview",        category: "multimodal", maxContext: 1000000, ...t4 },
    { modelId: "gemini-3.0-pro-image-preview",   displayName: "Gemini 3.0 Pro Image Preview",  category: "image",     maxContext: 1000000, ...t3 },
    { modelId: "gemini-3.0-flash-preview",       displayName: "Gemini 3.0 Flash Preview",      category: "multimodal", maxContext: 1000000, ...t2 },
    { modelId: "gemini-2.5-pro",                 displayName: "Gemini 2.5 Pro",                category: "multimodal", maxContext: 1000000, ...t3 },
    { modelId: "gemini-2.5-flash",               displayName: "Gemini 2.5 Flash",              category: "multimodal", maxContext: 1000000, ...t1 },
    { modelId: "gemini-2.5-flash-lite",           displayName: "Gemini 2.5 Flash Lite",        category: "multimodal", maxContext: 1000000, ...t1 },
    { modelId: "gemini-2.5-flash-image",          displayName: "Gemini 2.5 Flash Image",       category: "image",     maxContext: 1000000, ...t2 },

    // ==================== Google Veo (7) ====================
    { modelId: "veo-3.1-fast-generate-001",   displayName: "Veo 3.1 Fast",       category: "video", maxContext: 0, ...t4 },
    { modelId: "veo-3.1-generate-001",        displayName: "Veo 3.1",            category: "video", maxContext: 0, ...t5 },
    { modelId: "veo-3.0-fast-generate-preview", displayName: "Veo 3.0 Fast Preview", category: "video", maxContext: 0, ...t3 },
    { modelId: "veo-3.0-generate-preview",    displayName: "Veo 3.0 Preview",    category: "video", maxContext: 0, ...t4 },
    { modelId: "veo-3.0-fast-generate-001",   displayName: "Veo 3.0 Fast",       category: "video", maxContext: 0, ...t3 },
    { modelId: "veo-3.0-generate-001",        displayName: "Veo 3.0",            category: "video", maxContext: 0, ...t4 },
    { modelId: "veo-2.0-generate-001",        displayName: "Veo 2.0",            category: "video", maxContext: 0, ...t3 },

    // ==================== DeepSeek (10) ====================
    { modelId: "deepseek-v3.2",                 displayName: "DeepSeek V3.2",                 category: "chat",      maxContext: 64000, ...t2 },
    { modelId: "deepseek-v3.2-exp",             displayName: "DeepSeek V3.2 Exp",             category: "chat",      maxContext: 64000, ...t2 },
    { modelId: "deepseek-v3.2-exp-thinking",    displayName: "DeepSeek V3.2 Exp Thinking",    category: "reasoning", maxContext: 64000, ...t2 },
    { modelId: "deepseek-v3.1-terminus",         displayName: "DeepSeek V3.1 Terminus",        category: "chat",      maxContext: 64000, ...t2 },
    { modelId: "deepseek-v3.1-terminus-thinking", displayName: "DeepSeek V3.1 Terminus Thinking", category: "reasoning", maxContext: 64000, ...t2 },
    { modelId: "deepseek-v3.1",                  displayName: "DeepSeek V3.1",                 category: "chat",      maxContext: 64000, ...t1 },
    { modelId: "deepseek-v3",                    displayName: "DeepSeek V3",                   category: "chat",      maxContext: 64000, ...t1 },
    { modelId: "deepseek-v3-0324",               displayName: "DeepSeek V3 0324",              category: "chat",      maxContext: 64000, ...t1 },
    { modelId: "deepseek-r1",                    displayName: "DeepSeek R1",                   category: "reasoning", maxContext: 64000, ...t2 },
    { modelId: "deepseek-r1-0528",               displayName: "DeepSeek R1 0528",              category: "reasoning", maxContext: 64000, ...t2 },

    // ==================== xAI Grok (6) ====================
    { modelId: "x-ai/grok-4.1-fast-reasoning",     displayName: "Grok 4.1 Fast Reasoning",     category: "reasoning", maxContext: 128000, ...t4 },
    { modelId: "x-ai/grok-4.1-fast-non-reasoning", displayName: "Grok 4.1 Fast Non-Reasoning", category: "chat",      maxContext: 128000, ...t4 },
    { modelId: "x-ai/grok-4-fast-reasoning",       displayName: "Grok 4 Fast Reasoning",       category: "reasoning", maxContext: 128000, ...t4 },
    { modelId: "x-ai/grok-4-fast-non-reasoning",   displayName: "Grok 4 Fast Non-Reasoning",   category: "chat",      maxContext: 128000, ...t4 },
    { modelId: "x-ai/grok-4-fast",                 displayName: "Grok 4 Fast",                 category: "chat",      maxContext: 128000, ...t3 },
    { modelId: "x-ai/grok-code-fast-1",            displayName: "Grok Code Fast 1",            category: "code",      maxContext: 128000, ...t3 },

    // ==================== ByteDance Doubao (10) ====================
    { modelId: "doubao-seed-2.0-pro",      displayName: "Doubao Seed 2.0 Pro",      category: "chat",      maxContext: 32000, ...t2 },
    { modelId: "doubao-seed-2.0-code",     displayName: "Doubao Seed 2.0 Code",     category: "code",      maxContext: 32000, ...t2 },
    { modelId: "doubao-seed-2.0-mini",     displayName: "Doubao Seed 2.0 Mini",     category: "chat",      maxContext: 32000, ...t1 },
    { modelId: "doubao-seed-2.0-lite",     displayName: "Doubao Seed 2.0 Lite",     category: "chat",      maxContext: 32000, ...t1 },
    { modelId: "doubao-seed-1.6",          displayName: "Doubao Seed 1.6",          category: "chat",      maxContext: 32000, ...t1 },
    { modelId: "doubao-seed-1.6-flash",    displayName: "Doubao Seed 1.6 Flash",    category: "chat",      maxContext: 32000, ...t1 },
    { modelId: "doubao-seed-1.6-thinking", displayName: "Doubao Seed 1.6 Thinking", category: "reasoning", maxContext: 32000, ...t2 },
    { modelId: "doubao-1.5-thinking-pro",  displayName: "Doubao 1.5 Thinking Pro",  category: "reasoning", maxContext: 32000, ...t2 },
    { modelId: "doubao-1.5-vision-pro",    displayName: "Doubao 1.5 Vision Pro",    category: "multimodal", maxContext: 32000, ...t2 },
    { modelId: "doubao-1.5-pro-32k",       displayName: "Doubao 1.5 Pro",           category: "chat",      maxContext: 32000, ...t1 },

    // ==================== Qwen 阿里 (21) ====================
    { modelId: "qwen3.5-397b-a17b",              displayName: "Qwen3.5 397B",             category: "chat",      maxContext: 32000, ...t4 },
    { modelId: "qwen3-vl-30b-a3b-thinking",      displayName: "Qwen3 VL 30B Thinking",    category: "multimodal", maxContext: 32000, ...t2 },
    { modelId: "qwen3-vl-30b-a3b-instruct",      displayName: "Qwen3 VL 30B Instruct",    category: "multimodal", maxContext: 32000, ...t2 },
    { modelId: "qwen3-max-2026-01-23",           displayName: "Qwen3 Max 2026",           category: "chat",      maxContext: 32000, ...t3 },
    { modelId: "qwen3-max",                       displayName: "Qwen3 Max",                category: "chat",      maxContext: 32000, ...t3 },
    { modelId: "qwen3-max-preview",               displayName: "Qwen3 Max Preview",        category: "chat",      maxContext: 32000, ...t3 },
    { modelId: "qwen3-next-80b-a3b-instruct",    displayName: "Qwen3 Next 80B Instruct",  category: "chat",      maxContext: 32000, ...t2 },
    { modelId: "qwen3-next-80b-a3b-thinking",    displayName: "Qwen3 Next 80B Thinking",  category: "reasoning", maxContext: 32000, ...t2 },
    { modelId: "qwen3-coder-480b-a35b-instruct", displayName: "Qwen3 Coder 480B",         category: "code",      maxContext: 32000, ...t3 },
    { modelId: "qwen3-30b-a3b-thinking-2507",    displayName: "Qwen3 30B Thinking",       category: "reasoning", maxContext: 32000, ...t2 },
    { modelId: "qwen3-30b-a3b-instruct-2507",    displayName: "Qwen3 30B Instruct",       category: "chat",      maxContext: 32000, ...t1 },
    { modelId: "qwen3-235b-a22b-thinking-2507",  displayName: "Qwen3 235B Thinking",      category: "reasoning", maxContext: 32000, ...t3 },
    { modelId: "qwen3-235b-a22b-instruct-2507",  displayName: "Qwen3 235B Instruct",      category: "chat",      maxContext: 32000, ...t3 },
    { modelId: "qwen-3-235b-a22b",                displayName: "Qwen3 235B",               category: "chat",      maxContext: 32000, ...t3 },
    { modelId: "qwen3-32b",                       displayName: "Qwen3 32B",                category: "chat",      maxContext: 32000, ...t2 },
    { modelId: "qwen3-30b-a3b",                   displayName: "Qwen3 30B",                category: "chat",      maxContext: 32000, ...t1 },
    { modelId: "qwen-turbo",                      displayName: "Qwen Turbo",               category: "chat",      maxContext: 32000, ...t1 },
    { modelId: "qwen-vl-max-2025-01-25",         displayName: "Qwen VL Max",              category: "multimodal", maxContext: 32000, ...t3 },
    { modelId: "qwen2.5-max-2025-01-25",         displayName: "Qwen2.5 Max",              category: "chat",      maxContext: 32000, ...t3 },
    { modelId: "qwen-2.5-vl-72b-instruct",       displayName: "Qwen2.5 VL 72B",           category: "multimodal", maxContext: 32000, ...t2 },
    { modelId: "qwen-2.5-vl-7b-instruct",        displayName: "Qwen2.5 VL 7B",            category: "multimodal", maxContext: 32000, ...t1 },

    // ==================== GLM 智谱 (5) ====================
    { modelId: "z-ai/glm-5",    displayName: "GLM-5",       category: "chat", maxContext: 128000, ...t3 },
    { modelId: "z-ai/glm-4.7",  displayName: "GLM-4.7",     category: "chat", maxContext: 128000, ...t3 },
    { modelId: "z-ai/glm-4.6",  displayName: "GLM-4.6",     category: "chat", maxContext: 128000, ...t2 },
    { modelId: "glm-4.5",       displayName: "GLM-4.5",      category: "chat", maxContext: 128000, ...t2 },
    { modelId: "glm-4.5-air",   displayName: "GLM-4.5 Air",  category: "chat", maxContext: 128000, ...t1 },

    // ==================== Kimi 月之暗面 (4) ====================
    { modelId: "moonshotai/kimi-k2.5",  displayName: "Kimi K2.5",        category: "chat",      maxContext: 128000, ...t4 },
    { modelId: "moonshotai/kimi-k2",    displayName: "Kimi K2",          category: "chat",      maxContext: 128000, ...t3 },
    { modelId: "kimi-k2-thinking",      displayName: "Kimi K2 Thinking", category: "reasoning", maxContext: 128000, ...t3 },
    { modelId: "kimi-k2-0905",          displayName: "Kimi K2 0905",     category: "chat",      maxContext: 128000, ...t3 },

    // ==================== MiniMax (5) ====================
    { modelId: "minimax/minimax-m2.5-highspeed", displayName: "MiniMax M2.5 Highspeed", category: "chat", maxContext: 64000, ...t4 },
    { modelId: "minimax/minimax-m2.5",           displayName: "MiniMax M2.5",           category: "chat", maxContext: 64000, ...t4 },
    { modelId: "minimax/minimax-m2.1",           displayName: "MiniMax M2.1",           category: "chat", maxContext: 64000, ...t3 },
    { modelId: "minimax/minimax-m2",             displayName: "MiniMax M2",             category: "chat", maxContext: 64000, ...t3 },
    { modelId: "minimax-m1",                     displayName: "MiniMax M1",             category: "chat", maxContext: 64000, ...t2 },

    // ==================== Kling 可灵 (11) ====================
    { modelId: "kling-v3-omni",    displayName: "Kling V3 Omni",   category: "video", maxContext: 0, ...t4 },
    { modelId: "kling-v3",         displayName: "Kling V3",        category: "video", maxContext: 0, ...t4 },
    { modelId: "kling-v2-6",       displayName: "Kling V2.6",      category: "video", maxContext: 0, ...t3 },
    { modelId: "kling-v2-5-turbo", displayName: "Kling V2.5 Turbo", category: "video", maxContext: 0, ...t2 },
    { modelId: "kling-video-o1",   displayName: "Kling Video O1",  category: "video", maxContext: 0, ...t3 },
    { modelId: "kling-image-o1",   displayName: "Kling Image O1",  category: "image", maxContext: 0, ...t3 },
    { modelId: "kling-v2-new",     displayName: "Kling V2 New",    category: "video", maxContext: 0, ...t2 },
    { modelId: "kling-v2-1",       displayName: "Kling V2.1",      category: "video", maxContext: 0, ...t2 },
    { modelId: "kling-v2",         displayName: "Kling V2",        category: "video", maxContext: 0, ...t2 },
    { modelId: "kling-v1.5",       displayName: "Kling V1.5",      category: "video", maxContext: 0, ...t1 },
    { modelId: "kling-v1",         displayName: "Kling V1",        category: "video", maxContext: 0, ...t1 },

    // ==================== Vidu (4) ====================
    { modelId: "viduq2-turbo",  displayName: "Vidu Q2 Turbo", category: "video", maxContext: 0, ...t2 },
    { modelId: "viduq2-pro",    displayName: "Vidu Q2 Pro",   category: "video", maxContext: 0, ...t3 },
    { modelId: "viduq2",        displayName: "Vidu Q2",       category: "video", maxContext: 0, ...t2 },
    { modelId: "viduq1",        displayName: "Vidu Q1",       category: "video", maxContext: 0, ...t1 },

    // ==================== Arcee AI (1) ====================
    { modelId: "arcee-ai/trinity-large-preview", displayName: "Arcee Trinity Large Preview", category: "chat", maxContext: 128000, ...t3 },

    // ==================== Xiaomi 小米 (1) ====================
    { modelId: "xiaomi/mimo-v2-flash", displayName: "MiMo V2 Flash", category: "chat", maxContext: 32000, ...t1 },

    // ==================== Meituan 美团 (1) ====================
    { modelId: "meituan/longcat-flash-lite", displayName: "Meituan LongCat Flash Lite", category: "chat", maxContext: 64000, ...t1 },

    // ==================== Stepfun 阶跃星辰 (1) ====================
    { modelId: "stepfun/step-3.5-flash", displayName: "Step 3.5 Flash", category: "chat", maxContext: 32000, ...t1 },

    // ==================== Qiniu 语音服务 (2) ====================
    { modelId: "asr", displayName: "Qiniu ASR (语音识别)", category: "audio", maxContext: 0, ...t1 },
    { modelId: "tts", displayName: "Qiniu TTS (语音合成)", category: "audio", maxContext: 0, ...t1 },
  ];

  const allModelIds: string[] = [];

  for (const m of models) {
    await prisma.model.upsert({
      where: { modelId: m.modelId },
      update: {
        displayName: m.displayName,
        providerId: qiniuProvider.id,
        category: m.category,
        inputPrice: m.inputPrice,
        outputPrice: m.outputPrice,
        sellPrice: m.sellPrice,
        sellOutPrice: m.sellOutPrice,
        maxContext: m.maxContext,
        isActive: true,
        isManual: false,
      },
      create: {
        modelId: m.modelId,
        displayName: m.displayName,
        providerId: qiniuProvider.id,
        category: m.category,
        inputPrice: m.inputPrice,
        outputPrice: m.outputPrice,
        sellPrice: m.sellPrice,
        sellOutPrice: m.sellOutPrice,
        maxContext: m.maxContext,
        isActive: true,
        isManual: false,
      },
    });
    allModelIds.push(m.modelId);
    console.log(`  ✅ Model: ${m.modelId}`);
  }

  // --- Step 5: Create Qiniu channel ---
  const rawKey = process.env.QINIU_API_KEY || "placeholder-qiniu-key";
  const apiKeyValue = encryptApiKey(rawKey);

  const existingChannel = await prisma.channel.findFirst({
    where: { providerId: qiniuProvider.id, name: "Qiniu Primary" },
  });

  if (existingChannel) {
    await prisma.channel.update({
      where: { id: existingChannel.id },
      data: {
        apiKey: apiKeyValue,
        models: allModelIds,
        isActive: true,
      },
    });
    console.log(`  ✅ Channel updated: Qiniu Primary`);
  } else {
    await prisma.channel.create({
      data: {
        providerId: qiniuProvider.id,
        name: "Qiniu Primary",
        apiKey: apiKeyValue,
        priority: 10,
        weight: 1,
        isActive: true,
        models: allModelIds,
      },
    });
    console.log(`  ✅ Channel created: Qiniu Primary`);
  }

  console.log(`\n🎉 Seed complete! ${models.length} models configured via Qiniu/Sufy upstream.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
