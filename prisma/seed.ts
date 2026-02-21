import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

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
  console.log("🌱 Seeding database (Qiniu/Sufy upstream)...");

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

  // --- Step 4: Create models ---
  // Pricing: inputPrice/outputPrice = cost per 1K tokens; sellPrice/sellOutPrice = sell per 1K tokens
  // Sell prices are set at ~1.5-2x cost for margin
  const models = [
    // === OpenAI ===
    {
      modelId: "openai/gpt-5",
      displayName: "GPT-5",
      category: "chat",
      inputPrice: "0.0100",
      outputPrice: "0.0300",
      sellPrice: "0.015",
      sellOutPrice: "0.045",
      maxContext: 128000,
    },
    {
      modelId: "openai/gpt-5.2",
      displayName: "GPT-5.2",
      category: "chat",
      inputPrice: "0.0100",
      outputPrice: "0.0300",
      sellPrice: "0.015",
      sellOutPrice: "0.045",
      maxContext: 128000,
    },
    {
      modelId: "openai/gpt-5.2-codex",
      displayName: "GPT-5.2 Codex",
      category: "chat",
      inputPrice: "0.0120",
      outputPrice: "0.0360",
      sellPrice: "0.018",
      sellOutPrice: "0.054",
      maxContext: 128000,
    },
    {
      modelId: "openai/gpt-5.3-codex",
      displayName: "GPT-5.3 Codex",
      category: "chat",
      inputPrice: "0.0120",
      outputPrice: "0.0360",
      sellPrice: "0.018",
      sellOutPrice: "0.054",
      maxContext: 128000,
    },
    // === Anthropic ===
    {
      modelId: "claude-4.6-sonnet",
      displayName: "Claude 4.6 Sonnet",
      category: "chat",
      inputPrice: "0.0030",
      outputPrice: "0.0150",
      sellPrice: "0.006",
      sellOutPrice: "0.020",
      maxContext: 200000,
    },
    {
      modelId: "claude-4.6-opus",
      displayName: "Claude 4.6 Opus",
      category: "chat",
      inputPrice: "0.0150",
      outputPrice: "0.0750",
      sellPrice: "0.022",
      sellOutPrice: "0.110",
      maxContext: 200000,
    },
    {
      modelId: "claude-4.5-sonnet",
      displayName: "Claude 4.5 Sonnet",
      category: "chat",
      inputPrice: "0.0030",
      outputPrice: "0.0150",
      sellPrice: "0.006",
      sellOutPrice: "0.020",
      maxContext: 200000,
    },
    {
      modelId: "claude-4.5-opus",
      displayName: "Claude 4.5 Opus",
      category: "chat",
      inputPrice: "0.0150",
      outputPrice: "0.0750",
      sellPrice: "0.022",
      sellOutPrice: "0.110",
      maxContext: 200000,
    },
    {
      modelId: "claude-4.5-haiku",
      displayName: "Claude 4.5 Haiku",
      category: "chat",
      inputPrice: "0.0010",
      outputPrice: "0.0050",
      sellPrice: "0.002",
      sellOutPrice: "0.008",
      maxContext: 200000,
    },
    // === Google ===
    {
      modelId: "gemini-2.5-flash",
      displayName: "Gemini 2.5 Flash",
      category: "chat",
      inputPrice: "0.0005",
      outputPrice: "0.0015",
      sellPrice: "0.001",
      sellOutPrice: "0.003",
      maxContext: 1000000,
    },
    {
      modelId: "gemini-2.5-pro",
      displayName: "Gemini 2.5 Pro",
      category: "chat",
      inputPrice: "0.0025",
      outputPrice: "0.0100",
      sellPrice: "0.005",
      sellOutPrice: "0.015",
      maxContext: 1000000,
    },
    {
      modelId: "gemini-3.0-pro-preview",
      displayName: "Gemini 3.0 Pro Preview",
      category: "chat",
      inputPrice: "0.0025",
      outputPrice: "0.0100",
      sellPrice: "0.005",
      sellOutPrice: "0.015",
      maxContext: 1000000,
    },
    {
      modelId: "gemini-3.1-pro-preview",
      displayName: "Gemini 3.1 Pro Preview",
      category: "chat",
      inputPrice: "0.0025",
      outputPrice: "0.0100",
      sellPrice: "0.005",
      sellOutPrice: "0.015",
      maxContext: 1000000,
    },
    // === DeepSeek ===
    {
      modelId: "deepseek-v3",
      displayName: "DeepSeek V3",
      category: "chat",
      inputPrice: "0.0005",
      outputPrice: "0.0020",
      sellPrice: "0.001",
      sellOutPrice: "0.003",
      maxContext: 64000,
    },
    {
      modelId: "deepseek-v3.1",
      displayName: "DeepSeek V3.1",
      category: "chat",
      inputPrice: "0.0005",
      outputPrice: "0.0020",
      sellPrice: "0.001",
      sellOutPrice: "0.003",
      maxContext: 64000,
    },
    {
      modelId: "deepseek-r1",
      displayName: "DeepSeek R1",
      category: "chat",
      inputPrice: "0.0010",
      outputPrice: "0.0040",
      sellPrice: "0.002",
      sellOutPrice: "0.006",
      maxContext: 64000,
    },
    {
      modelId: "deepseek-r1-0528",
      displayName: "DeepSeek R1 0528",
      category: "chat",
      inputPrice: "0.0010",
      outputPrice: "0.0040",
      sellPrice: "0.002",
      sellOutPrice: "0.006",
      maxContext: 64000,
    },
    // === Qwen (阿里) ===
    {
      modelId: "qwen3-max",
      displayName: "Qwen3 Max",
      category: "chat",
      inputPrice: "0.0020",
      outputPrice: "0.0060",
      sellPrice: "0.003",
      sellOutPrice: "0.009",
      maxContext: 32000,
    },
    {
      modelId: "qwen3-235b-a22b",
      displayName: "Qwen3 235B A22B",
      category: "chat",
      inputPrice: "0.0015",
      outputPrice: "0.0050",
      sellPrice: "0.003",
      sellOutPrice: "0.008",
      maxContext: 32000,
    },
    {
      modelId: "qwen3-coder-480b-a35b-instruct",
      displayName: "Qwen3 Coder 480B",
      category: "chat",
      inputPrice: "0.0020",
      outputPrice: "0.0060",
      sellPrice: "0.003",
      sellOutPrice: "0.009",
      maxContext: 32000,
    },
    // === GLM (智谱) ===
    {
      modelId: "z-ai/glm-5",
      displayName: "GLM-5",
      category: "chat",
      inputPrice: "0.0020",
      outputPrice: "0.0060",
      sellPrice: "0.003",
      sellOutPrice: "0.009",
      maxContext: 128000,
    },
    {
      modelId: "z-ai/glm-4.7",
      displayName: "GLM-4.7",
      category: "chat",
      inputPrice: "0.0010",
      outputPrice: "0.0040",
      sellPrice: "0.002",
      sellOutPrice: "0.006",
      maxContext: 128000,
    },
    {
      modelId: "glm-4.5",
      displayName: "GLM-4.5",
      category: "chat",
      inputPrice: "0.0010",
      outputPrice: "0.0040",
      sellPrice: "0.002",
      sellOutPrice: "0.006",
      maxContext: 128000,
    },
    // === Kimi (月之暗面) ===
    {
      modelId: "kimi-k2",
      displayName: "Kimi K2",
      category: "chat",
      inputPrice: "0.0020",
      outputPrice: "0.0060",
      sellPrice: "0.003",
      sellOutPrice: "0.009",
      maxContext: 128000,
    },
    {
      modelId: "moonshotai/kimi-k2.5",
      displayName: "Kimi K2.5",
      category: "chat",
      inputPrice: "0.0020",
      outputPrice: "0.0060",
      sellPrice: "0.003",
      sellOutPrice: "0.009",
      maxContext: 128000,
    },
    // === MiniMax ===
    {
      modelId: "minimax/minimax-m2.5",
      displayName: "MiniMax M2.5",
      category: "chat",
      inputPrice: "0.0010",
      outputPrice: "0.0040",
      sellPrice: "0.002",
      sellOutPrice: "0.006",
      maxContext: 64000,
    },
    {
      modelId: "MiniMax-M1",
      displayName: "MiniMax M1",
      category: "chat",
      inputPrice: "0.0010",
      outputPrice: "0.0040",
      sellPrice: "0.002",
      sellOutPrice: "0.006",
      maxContext: 64000,
    },
    // === xAI ===
    {
      modelId: "x-ai/grok-4-fast-reasoning",
      displayName: "Grok 4 Fast Reasoning",
      category: "chat",
      inputPrice: "0.0050",
      outputPrice: "0.0150",
      sellPrice: "0.008",
      sellOutPrice: "0.022",
      maxContext: 128000,
    },
    {
      modelId: "x-ai/grok-4.1-fast-reasoning",
      displayName: "Grok 4.1 Fast Reasoning",
      category: "chat",
      inputPrice: "0.0050",
      outputPrice: "0.0150",
      sellPrice: "0.008",
      sellOutPrice: "0.022",
      maxContext: 128000,
    },
    // === ByteDance (豆包) ===
    {
      modelId: "doubao-seed-1.6",
      displayName: "豆包 Seed 1.6",
      category: "chat",
      inputPrice: "0.0005",
      outputPrice: "0.0020",
      sellPrice: "0.001",
      sellOutPrice: "0.003",
      maxContext: 32000,
    },
    {
      modelId: "doubao-1.5-thinking-pro",
      displayName: "豆包 1.5 Thinking Pro",
      category: "chat",
      inputPrice: "0.0010",
      outputPrice: "0.0040",
      sellPrice: "0.002",
      sellOutPrice: "0.006",
      maxContext: 32000,
    },
    // === Xiaomi ===
    {
      modelId: "xiaomi/mimo-v2-flash",
      displayName: "MiMo V2 Flash",
      category: "chat",
      inputPrice: "0.0005",
      outputPrice: "0.0015",
      sellPrice: "0.001",
      sellOutPrice: "0.003",
      maxContext: 32000,
    },
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
      },
    });
    allModelIds.push(m.modelId);
    console.log(`  ✅ Model: ${m.modelId}`);
  }

  // --- Step 5: Create Qiniu channel ---
  const apiKeyValue = process.env.QINIU_API_KEY || "placeholder-qiniu-key";

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

  console.log(`\n🎉 Seed complete! ${models.length} models configured via Qiniu upstream.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
