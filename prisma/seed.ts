import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://dezix:dezix_password@localhost:5432/dezix?schema=public",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // --- Providers ---
  const providers = [
    {
      name: "openai",
      baseUrl: "https://api.openai.com",
    },
    {
      name: "anthropic",
      baseUrl: "https://api.anthropic.com",
    },
    {
      name: "google",
      baseUrl: "https://generativelanguage.googleapis.com",
    },
    {
      name: "deepseek",
      baseUrl: "https://api.deepseek.com",
    },
  ];

  const providerRecords: Record<string, { id: string }> = {};

  for (const p of providers) {
    const record = await prisma.provider.upsert({
      where: { name: p.name },
      update: { baseUrl: p.baseUrl },
      create: { name: p.name, baseUrl: p.baseUrl, isActive: true },
    });
    providerRecords[p.name] = record;
    console.log(`  ✅ Provider: ${p.name} (${record.id})`);
  }

  // --- Models ---
  const models = [
    {
      modelId: "gpt-4o",
      displayName: "GPT-4o",
      provider: "openai",
      inputPrice: "0.0025",
      outputPrice: "0.0100",
      sellPrice: "0.005",
      sellOutPrice: "0.015",
      maxContext: 128000,
    },
    {
      modelId: "gpt-4o-mini",
      displayName: "GPT-4o Mini",
      provider: "openai",
      inputPrice: "0.0005",
      outputPrice: "0.0015",
      sellPrice: "0.001",
      sellOutPrice: "0.002",
      maxContext: 128000,
    },
    {
      modelId: "claude-sonnet-4-20250514",
      displayName: "Claude Sonnet 4",
      provider: "anthropic",
      inputPrice: "0.0030",
      outputPrice: "0.0150",
      sellPrice: "0.006",
      sellOutPrice: "0.020",
      maxContext: 200000,
    },
    {
      modelId: "claude-3-5-haiku-20241022",
      displayName: "Claude 3.5 Haiku",
      provider: "anthropic",
      inputPrice: "0.0010",
      outputPrice: "0.0040",
      sellPrice: "0.002",
      sellOutPrice: "0.006",
      maxContext: 200000,
    },
    {
      modelId: "gemini-2.0-flash",
      displayName: "Gemini 2.0 Flash",
      provider: "google",
      inputPrice: "0.0005",
      outputPrice: "0.0010",
      sellPrice: "0.001",
      sellOutPrice: "0.002",
      maxContext: 1000000,
    },
    {
      modelId: "deepseek-chat",
      displayName: "DeepSeek Chat (V3)",
      provider: "deepseek",
      inputPrice: "0.0005",
      outputPrice: "0.0010",
      sellPrice: "0.001",
      sellOutPrice: "0.002",
      maxContext: 64000,
    },
    {
      modelId: "deepseek-reasoner",
      displayName: "DeepSeek Reasoner (R1)",
      provider: "deepseek",
      inputPrice: "0.0010",
      outputPrice: "0.0040",
      sellPrice: "0.002",
      sellOutPrice: "0.006",
      maxContext: 64000,
    },
  ];

  for (const m of models) {
    const providerId = providerRecords[m.provider].id;
    await prisma.model.upsert({
      where: { modelId: m.modelId },
      update: {
        displayName: m.displayName,
        inputPrice: m.inputPrice,
        outputPrice: m.outputPrice,
        sellPrice: m.sellPrice,
        sellOutPrice: m.sellOutPrice,
        maxContext: m.maxContext,
      },
      create: {
        modelId: m.modelId,
        displayName: m.displayName,
        providerId,
        category: "chat",
        inputPrice: m.inputPrice,
        outputPrice: m.outputPrice,
        sellPrice: m.sellPrice,
        sellOutPrice: m.sellOutPrice,
        maxContext: m.maxContext,
        isActive: true,
      },
    });
    console.log(`  ✅ Model: ${m.modelId}`);
  }

  // --- Channels (one per provider, API keys from env) ---
  const channelConfigs = [
    {
      provider: "openai",
      name: "OpenAI Primary",
      envKey: "OPENAI_API_KEY",
      models: ["gpt-4o", "gpt-4o-mini"],
    },
    {
      provider: "anthropic",
      name: "Anthropic Primary",
      envKey: "ANTHROPIC_API_KEY",
      models: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022"],
    },
    {
      provider: "google",
      name: "Google Primary",
      envKey: "GOOGLE_API_KEY",
      models: ["gemini-2.0-flash"],
    },
    {
      provider: "deepseek",
      name: "DeepSeek Primary",
      envKey: "DEEPSEEK_API_KEY",
      models: ["deepseek-chat", "deepseek-reasoner"],
    },
  ];

  for (const ch of channelConfigs) {
    const providerId = providerRecords[ch.provider].id;
    const apiKeyValue = process.env[ch.envKey] || `placeholder-${ch.provider}-key`;

    // Check if channel already exists for this provider
    const existing = await prisma.channel.findFirst({
      where: { providerId, name: ch.name },
    });

    if (existing) {
      await prisma.channel.update({
        where: { id: existing.id },
        data: {
          apiKey: apiKeyValue,
          models: ch.models,
        },
      });
      console.log(`  ✅ Channel updated: ${ch.name}`);
    } else {
      await prisma.channel.create({
        data: {
          providerId,
          name: ch.name,
          apiKey: apiKeyValue,
          priority: 10,
          weight: 1,
          isActive: true,
          models: ch.models,
        },
      });
      console.log(`  ✅ Channel created: ${ch.name}`);
    }
  }

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
