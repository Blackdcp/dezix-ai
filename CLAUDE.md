# CLAUDE.md — Dezix AI 项目指南

> Claude 每次启动时自动读取此文件，了解项目上下文。

## 项目简介

Dezix AI 是一个统一 LLM API 网关平台（仿 n1n.ai），面向国内开发者，一个 API Key 访问多个 AI 模型。

## 技术栈

| 层 | 技术 |
|---|---|
| 前后端 | Next.js 16 (App Router) + TypeScript |
| 数据库 | PostgreSQL 16 (Prisma ORM) |
| 缓存 | Redis 7 (限流、会话、余额缓存) |
| 认证 | NextAuth.js v5 (beta) + Prisma Adapter |
| UI | Tailwind CSS v4 + shadcn/ui |
| 支付 | 支付宝/微信支付 (开发阶段用沙箱模拟) |
| 部署 | Docker |

## 项目结构

```
dezix-ai/
├── CLAUDE.md                    # 本文件 — 项目上下文
├── PROGRESS.md                  # 分阶段进度 checklist
├── docker-compose.yml           # PostgreSQL + Redis
├── Dockerfile                   # 生产构建
├── .env.example                 # 环境变量模板
├── prisma/
│   ├── schema.prisma            # 数据库 Schema (12 张表)
│   └── seed.ts                  # 种子数据 (Phase 2)
├── src/
│   ├── app/
│   │   ├── (auth)/              # 登录、注册页面
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (console)/           # 控制台 (需登录)
│   │   │   ├── layout.tsx       # 控制台布局 (侧边栏 + 顶栏)
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── api-keys/page.tsx    # API 密钥管理 (Phase 3)
│   │   │   ├── models/page.tsx      # 模型市场 (Phase 4)
│   │   │   ├── usage/page.tsx       # 用量统计 (Phase 4)
│   │   │   └── playground/page.tsx  # API Playground (Phase 4)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── console/            # 控制台内部 API
│   │   │   │   ├── dashboard/route.ts
│   │   │   │   ├── api-keys/route.ts + [id]/route.ts
│   │   │   │   ├── models/route.ts
│   │   │   │   └── usage/route.ts
│   │   │   └── v1/             # API 网关端点 (Phase 2)
│   │   ├── globals.css
│   │   ├── layout.tsx           # 根布局
│   │   └── page.tsx             # 首页 (Phase 6)
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 组件
│   │   └── layout/              # 控制台布局组件
│   │       ├── console-sidebar.tsx
│   │       └── console-header.tsx
│   ├── lib/
│   │   ├── auth.ts              # NextAuth 配置
│   │   ├── db.ts                # Prisma 客户端单例
│   │   ├── redis.ts             # Redis 客户端
│   │   ├── utils.ts             # shadcn/ui cn() 工具
│   │   └── gateway/             # API 网关核心 (Phase 2)
│   └── middleware.ts            # 路由保护
├── package.json
└── tsconfig.json
```

## 开发命令

```bash
# 启动基础设施 (Docker stack 名: dezix-ai)
docker compose up -d

# 数据库操作 (需设置 DATABASE_URL 环境变量)
npx prisma generate          # 生成 Prisma Client
npx prisma migrate dev       # 运行迁移
npx prisma db seed           # 填充种子数据
npx prisma studio            # 数据库 GUI

# 开发
npm run dev                  # 启动开发服务器 (localhost:3000)
npm run build                # 生产构建
npm run lint                 # ESLint 检查

# 测试 (Phase 8)
npm run test                 # Vitest
```

## Docker 信息

| 项目 | 值 |
|------|-----|
| Stack 名 | `dezix-ai` |
| PostgreSQL 容器 | `dezix-postgres` (端口 5432) |
| Redis 容器 | `dezix-redis` (端口 6379) |
| DB 用户 / 密码 / 库名 | `dezix` / `dezix_password` / `dezix` |

## 数据库表概览

| 表 | 用途 |
|---|---|
| User | 用户 + 余额 + 角色 |
| Account / Session / VerificationToken | NextAuth 认证相关 |
| ApiKey | API 密钥 (哈希存储) + 子 Key 权限 |
| Provider | 上游供应商 (OpenAI, Anthropic...) |
| Channel | 上游渠道 (同一供应商多 Key/多端点) |
| Model | 模型列表 + 定价 (成本价 + 售价) |
| UsageLog | 每次请求的完整记录 |
| Transaction | 充值/扣费/返佣流水 |
| ReferralReward | 推荐奖励记录 |
| SystemConfig | 系统配置键值对 |

## 环境变量

参见 `.env.example`，关键变量:
- `DATABASE_URL` — PostgreSQL 连接串 (`postgresql://dezix:dezix_password@localhost:5432/dezix?schema=public`)
- `REDIS_URL` — Redis 连接串 (`redis://localhost:6379`)
- `NEXTAUTH_SECRET` — NextAuth 签名密钥
- `NEXTAUTH_URL` — 应用 URL (开发: http://localhost:3000)
- `NEXT_PUBLIC_APP_NAME` — 品牌名 (`Dezix AI`)

## 开发约定

1. **全中文 UI** — 所有面向用户的文字使用中文
2. **App Router** — 使用 Next.js App Router，不用 Pages Router
3. **Server Components 优先** — 只在需要交互时使用 `"use client"`
4. **API 路由** — 网关 API 在 `/api/v1/`，内部 API 在 `/api/`
5. **认证** — NextAuth v5，Credentials Provider (邮箱 + 密码)
6. **密码** — bcryptjs 哈希，saltRounds=12
7. **API Key 格式** — `sk-dezix-` 前缀 + 随机字符串，数据库存哈希值
8. **金额** — 使用 Decimal 类型，避免浮点精度问题
9. **分阶段开发** — 共 8 个阶段，详见 PROGRESS.md

## 跨会话继续开发

新会话启动后，告诉 Claude:
> 读一下 PROGRESS.md，继续上次的工作
