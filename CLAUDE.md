# CLAUDE.md — Dezix AI 项目指南

> Claude 每次启动时自动读取此文件，了解项目上下文。

## 项目简介

Dezix AI 是一个统一 LLM API 网关平台（仿 n1n.ai），面向国内开发者，一个 API Key 访问多个 AI 模型。

## 当前状态

**全部 8 个阶段已完成。** 47 个路由编译通过，68 个测试用例全部通过。

| 阶段 | 状态 | Git Commit |
|------|------|------------|
| Phase 1: 项目基础设施 | ✅ 完成 | `ca203e3` |
| Phase 2: 核心 API 网关引擎 | ✅ 完成 | `978026f` |
| Phase 3: API Key 管理 + Dashboard | ✅ 完成 | `f3f9b54` |
| Phase 4: 用量统计 + 模型市场 + Playground | ✅ 完成 | `49a3f23` |
| Phase 5: 充值计费 + AI 对话 + 用户设置 | ✅ 完成 | `02c5208` |
| Phase 6: 营销官网 + 文档站 | ✅ 完成 | `308e65b` |
| Phase 7: 管理后台 + 推荐返佣 | ✅ 完成 | `99f1a76` |
| Phase 8: 生产加固 | ✅ 完成 | `5c29333` |

## 技术栈

| 层 | 技术 |
|---|---|
| 前后端 | Next.js 16 (App Router) + TypeScript |
| 数据库 | PostgreSQL 16 (Prisma ORM 7 + PrismaPg driver adapter) |
| 缓存/限流 | Redis 7 (ioredis) |
| 认证 | NextAuth.js v5 (beta) + Credentials Provider |
| UI | Tailwind CSS v4 + shadcn/ui |
| 验证 | Zod v4 (15 个路由的输入验证) |
| 加密 | AES-256-GCM (渠道 API Key 加密存储) |
| 测试 | Vitest v4 (7 个测试文件, 68 个用例) |
| 部署 | Docker (multi-stage, tini, healthcheck) |
| CI | GitHub Actions (lint → tsc → test → build) |

## 项目结构

```
dezix-ai/
├── CLAUDE.md                    # 本文件 — 项目上下文
├── PROGRESS.md                  # 分阶段进度 checklist
├── docker-compose.yml           # PostgreSQL + Redis + App (production profile)
├── Dockerfile                   # 生产构建 (tini + healthcheck)
├── .dockerignore                # Docker 忽略文件
├── .github/workflows/ci.yml    # CI Pipeline
├── .env.example                 # 环境变量模板
├── vitest.config.ts             # Vitest 配置
├── prisma/
│   ├── schema.prisma            # 数据库 Schema (12 张表)
│   └── seed.ts                  # 种子数据
├── src/
│   ├── app/
│   │   ├── (auth)/              # 登录、注册页面
│   │   ├── (console)/           # 控制台 (需登录, 10 个页面)
│   │   ├── (admin)/             # 管理后台 (ADMIN 角色, 5 个页面)
│   │   ├── (marketing)/         # 营销官网 (首页/定价/FAQ/模型列表)
│   │   ├── (docs)/              # 文档站 (快速开始/API 参考/SDK 示例)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── register/route.ts       # 注册 (Zod + IP 限流)
│   │   │   ├── health/route.ts         # 健康检查 (PG + Redis)
│   │   │   ├── public/models/route.ts  # 公开模型列表
│   │   │   ├── console/               # 控制台 API (12 个路由)
│   │   │   ├── admin/                 # 管理后台 API (9 个路由)
│   │   │   └── v1/                    # 网关 API (CORS + IP 限流)
│   │   │       ├── chat/completions/route.ts
│   │   │       └── models/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 组件
│   │   ├── layout/              # 布局组件 (console/admin/marketing/docs)
│   │   ├── marketing/           # 营销页面组件
│   │   ├── chat/                # Markdown 渲染器
│   │   └── docs/                # 代码块组件
│   ├── lib/
│   │   ├── auth.ts              # NextAuth 配置
│   │   ├── db.ts                # Prisma 客户端单例
│   │   ├── redis.ts             # Redis 客户端
│   │   ├── admin.ts             # requireAdmin() 鉴权
│   │   ├── cors.ts              # CORS 工具函数
│   │   ├── encryption.ts        # AES-256-GCM 加解密
│   │   ├── utils.ts             # shadcn/ui cn() 工具
│   │   ├── validations/         # Zod schema (common/auth/gateway/console/admin)
│   │   └── gateway/             # API 网关核心引擎
│   │       ├── index.ts         # 主编排器 (auth → rate limit → route → proxy → billing)
│   │       ├── auth.ts          # API Key 认证 (SHA-256 + Redis 缓存)
│   │       ├── rate-limiter.ts  # Redis 滑动窗口限流 (API Key + IP)
│   │       ├── router.ts        # 渠道选择 (优先级 + 权重随机 + 解密)
│   │       ├── billing.ts       # 余额预检 + 原子扣费
│   │       ├── stream.ts        # SSE 流式转换器
│   │       ├── token-counter.ts # 启发式 Token 估算
│   │       ├── logger.ts        # 异步请求日志
│   │       ├── errors.ts        # OpenAI 兼容错误格式
│   │       ├── types.ts         # 类型定义
│   │       └── adapters/        # 供应商适配器 (OpenAI/Anthropic/Google/DeepSeek)
│   ├── types/
│   │   └── next-auth.d.ts       # Session/JWT 类型扩展
│   └── middleware.ts            # 路由保护 + ADMIN 角色检查
├── package.json
└── tsconfig.json
```

## 开发命令

```bash
# 启动基础设施 (Docker stack 名: dezix-ai)
docker compose up -d

# 生产环境启动 (含 App 容器)
docker compose --profile production up -d

# 数据库操作
npx prisma generate          # 生成 Prisma Client
npx prisma db push           # 同步 Schema 到数据库
npx prisma db seed           # 填充种子数据
npx prisma studio            # 数据库 GUI

# 开发
npm run dev                  # 启动开发服务器 (localhost:3000)
npm run build                # 生产构建
npm run lint                 # ESLint 检查

# 测试
npm run test                 # Vitest 单次运行 (7 文件, 68 用例)
npm run test:watch           # Vitest 监听模式
```

## Docker 信息

| 项目 | 值 |
|------|-----|
| Stack 名 | `dezix-ai` |
| PostgreSQL 容器 | `dezix-postgres` (端口 5432, healthcheck) |
| Redis 容器 | `dezix-redis` (端口 6379, AOF + LRU 256MB, healthcheck) |
| App 容器 | `dezix-app` (端口 3000, production profile, tini PID 1) |
| DB 用户 / 密码 / 库名 | `dezix` / `dezix_password` / `dezix` |

## 数据库表概览

| 表 | 用途 |
|---|---|
| User | 用户 + 余额 + 角色 (ADMIN/USER) + 推荐码 |
| Account / Session / VerificationToken | NextAuth 认证相关 |
| ApiKey | API 密钥 (SHA-256 哈希存储) + 配额 + 模型白名单 + 限流 |
| Provider | 上游供应商 (OpenAI, Anthropic, Google, DeepSeek) |
| Channel | 上游渠道 (apiKey AES-256-GCM 加密, 优先级/权重) |
| Model | 模型列表 + 定价 (成本价 + 售价, Decimal 精度) |
| UsageLog | 每次请求的完整记录 (Token/费用/延迟/IP) |
| Transaction | 充值/扣费/返佣/管理员调整流水 |
| ReferralReward | 推荐奖励记录 |
| SystemConfig | 系统配置键值对 (如 referral_commission_rate) |

## 环境变量

参见 `.env.example`，关键变量:
- `DATABASE_URL` — PostgreSQL 连接串
- `REDIS_URL` — Redis 连接串
- `NEXTAUTH_SECRET` — NextAuth 签名密钥
- `NEXTAUTH_URL` — 应用 URL
- `ENCRYPTION_KEY` — 渠道 API Key 加密密钥 (64 字符 hex, 32 字节)
- `NEXT_PUBLIC_APP_NAME` — 品牌名 (`Dezix AI`)
- `NEXT_PUBLIC_APP_URL` — 应用公开 URL

## 安全特性 (Phase 8)

- **输入验证**: Zod v4 schema 覆盖所有 15 个用户输入路由
- **安全头**: X-Frame-Options(DENY), X-Content-Type-Options(nosniff), HSTS, Referrer-Policy, Permissions-Policy
- **CORS**: 网关路由 `/api/v1/*` 允许跨域 (OPTIONS 预检 + Access-Control 头)
- **加密**: 渠道 API Key AES-256-GCM 加密存储, 向后兼容明文
- **IP 限流**: 注册 5/min, Chat Completions 60/min, Models 30/min (叠加 API Key 限流)
- **密码**: bcryptjs hash, saltRounds=12
- **API Key**: `sk-dezix-` 前缀, SHA-256 哈希存储, 一次性明文展示

## 开发约定

1. **全中文 UI** — 所有面向用户的文字使用中文
2. **App Router** — 使用 Next.js App Router，不用 Pages Router
3. **Server Components 优先** — 只在需要交互时使用 `"use client"`
4. **API 路由** — 网关 API 在 `/api/v1/`，内部 API 在 `/api/`
5. **认证** — NextAuth v5，Credentials Provider (邮箱 + 密码)
6. **金额** — 使用 Decimal 类型，避免浮点精度问题
7. **验证** — 所有 API 路由用 Zod `.safeParse()` 验证输入
8. **测试** — 新功能需添加对应 Vitest 测试

## 下次启动备注

- 项目路径: `E:\Claude code\dezix-ai`
- Docker Desktop 需手动启动，然后 `docker compose up -d`
- Windows 下 npx 有 PATH 问题，可用 `node node_modules/next/dist/bin/next dev`
- 所有 8 个阶段已完成，可进入后续优化或新功能开发

## 跨会话继续开发

新会话启动后，告诉 Claude:
> 读一下 PROGRESS.md，继续上次的工作
