/**
 * 创建测试 API Key 的脚本
 *
 * 用法:
 *   npx tsx scripts/create-test-key.ts [user-email]
 *
 * 如果不指定 email，会使用数据库中第一个用户。
 * 如果没有用户，会自动创建一个测试用户（test@dezix.ai）。
 *
 * 输出: 可直接用于 curl 测试的 API Key
 */

import { randomBytes, createHash } from "crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://dezix:dezix_password@localhost:5432/dezix?schema=public",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];

  // 查找或创建用户
  let user;
  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`❌ 用户 ${email} 不存在`);
      process.exit(1);
    }
  } else {
    user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
    if (!user) {
      console.log("📝 没有用户，创建测试用户 test@dezix.ai ...");
      user = await prisma.user.create({
        data: {
          email: "test@dezix.ai",
          name: "Test User",
          passwordHash: "$2b$12$placeholder.not.a.real.hash.for.testing.only",
          balance: 10.0, // 给 10 元余额用于测试
        },
      });
      console.log(`  ✅ 用户已创建: ${user.email} (余额: ¥10.00)`);
    }
  }

  // 检查余额，如果为 0 则充值
  if (Number(user.balance) <= 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: 10.0 },
    });
    console.log(`  💰 已为用户 ${user.email} 充值 ¥10.00`);
  }

  // 生成 API Key
  const rawKey = `sk-dezix-${randomBytes(24).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 16) + "...";

  await prisma.apiKey.create({
    data: {
      userId: user.id,
      name: "Test Key",
      keyHash,
      keyPrefix,
      isActive: true,
      rateLimit: 60, // 60 requests/min
      modelWhitelist: [], // 空 = 允许所有模型
    },
  });

  console.log("\n" + "=".repeat(60));
  console.log("🔑 测试 API Key 已创建");
  console.log("=".repeat(60));
  console.log(`\n  用户:  ${user.email} (${user.id})`);
  console.log(`  Key:   ${rawKey}`);
  console.log(`  前缀:  ${keyPrefix}`);
  console.log("\n📋 复制以下命令测试:\n");
  console.log(`# 非流式请求`);
  console.log(
    `curl http://localhost:3000/api/v1/chat/completions \\
  -H "Authorization: Bearer ${rawKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'`
  );
  console.log(`\n# 流式请求`);
  console.log(
    `curl http://localhost:3000/api/v1/chat/completions \\
  -H "Authorization: Bearer ${rawKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}],"stream":true}'`
  );
  console.log(`\n# 模型列表`);
  console.log(
    `curl http://localhost:3000/api/v1/models \\
  -H "Authorization: Bearer ${rawKey}"`
  );
  console.log();
}

main()
  .catch((e) => {
    console.error("❌ 失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
