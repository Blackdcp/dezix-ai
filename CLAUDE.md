# CLAUDE.md — Dezix AI 项目指南

> Claude 每次启动时自动读取此文件，了解项目上下文。

## 项目简介

Dezix AI 是一个统一 LLM API 网关平台（仿 n1n.ai），面向国内开发者，一个 API Key 访问多个 AI 模型。

## 当前状态

**Phase 1-10 已完成，Phase 14 (i18n) 进行中。**

**线上地址**: https://dezix-ai.vercel.app

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
| Phase 9: Vercel 部署 | ✅ 完成 | `743ee4d` |
| Phase 10: OAuth 社交登录 (GitHub + Google) | ✅ 完成 | — |
| Phase 14: 多语言支持 (i18n) | 🔧 进行中 | — |

## 技术栈

| 层 | 技术 |
|---|---|
| 前后端 | Next.js 16 (App Router) + TypeScript |
| 数据库 | Supabase PostgreSQL (Prisma ORM 7 + PrismaPg driver adapter + PgBouncer) |
| 缓存/限流 | Upstash Redis (@upstash/redis HTTP) + @upstash/ratelimit |
| 认证 | NextAuth.js v5 (beta) + Credentials + GitHub OAuth + Google OAuth |
| UI | Tailwind CSS v4 + shadcn/ui |
| 验证 | Zod v4 (15 个路由的输入验证) |
| 加密 | AES-256-GCM (渠道 API Key 加密存储) |
| 测试 | Vitest v4 (7 个测试文件, 67 个用例) |
| 部署 | Vercel Serverless + Supabase + Upstash (Docker 保留用于本地开发) |
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
| Provider | 上游供应商 (当前: qiniu 七牛云/Sufy，旧的 4 个已停用) |
| Channel | 上游渠道 (apiKey AES-256-GCM 加密, 优先级/权重) |
| Model | 模型列表 + 定价 (成本价 + 售价, Decimal 精度) |
| UsageLog | 每次请求的完整记录 (Token/费用/延迟/IP) |
| Transaction | 充值/扣费/返佣/管理员调整流水 |
| ReferralReward | 推荐奖励记录 |
| SystemConfig | 系统配置键值对 (如 referral_commission_rate) |

## 环境变量

参见 `.env.example`，关键变量:
- `DATABASE_URL` — Supabase PostgreSQL 连接串 (PgBouncer, port 6543)
- `DIRECT_DATABASE_URL` — Supabase 直连串 (port 5432, 用于 prisma migrate)
- `UPSTASH_REDIS_REST_URL` — Upstash Redis REST API URL
- `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis REST API Token
- `NEXTAUTH_SECRET` — NextAuth 签名密钥
- `NEXTAUTH_URL` — 应用 URL
- `ENCRYPTION_KEY` — 渠道 API Key 加密密钥 (64 字符 hex, 32 字节)
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — GitHub OAuth App 凭证
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth Client 凭证
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
5. **认证** — NextAuth v5，Credentials + GitHub OAuth + Google OAuth
6. **金额** — 使用 Decimal 类型，避免浮点精度问题
7. **验证** — 所有 API 路由用 Zod `.safeParse()` 验证输入
8. **测试** — 新功能需添加对应 Vitest 测试

## 下次启动备注

- 项目路径: `E:\Claude code\dezix-ai`
- 线上地址: https://dezix-ai.vercel.app
- GitHub: `Blackdcp/dezix-ai` (private)
- Git 代理: `git -c http.proxy=http://127.0.0.1:7897 -c https.proxy=http://127.0.0.1:7897 push`
- curl 代理: `curl --proxy http://127.0.0.1:7897`
- **Phase 9 部署已完成**，线上健康检查 + 页面 + 模型 API 全部通过
- **Phase 10 OAuth 代码已完成** (commit `c2d925e`)，已推送 GitHub + Vercel 自动部署

### Phase 10 OAuth 待办 (需用户手动操作)
- [ ] 创建 GitHub OAuth App: https://github.com/settings/developers → callback `https://dezix-ai.vercel.app/api/auth/callback/github`
- [ ] 创建 Google OAuth Client: https://console.cloud.google.com/apis/credentials → redirect URI `https://dezix-ai.vercel.app/api/auth/callback/google`
- [ ] 在 Vercel 添加 4 个环境变量: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] Vercel Redeploy 使环境变量生效
- [ ] 线上测试: GitHub 新用户登录、Google 新用户登录、OAuth 邮箱匹配已有密码用户、带推荐码的 OAuth 注册

### 七牛云上游 (已接入完成 ✅)
- `src/lib/gateway/adapters/registry.ts` — 注册 `qiniu` 适配器 (映射到 DeepSeekAdapter)
- `prisma/seed.ts` — 七牛云上游，91 个模型 (13 家厂商)
- 线上已验证: 非流式/流式/多厂商模型全部转发正常

### 品牌映射 + 模型分类 (已完成 ✅, commit `b50a35b`)
- `src/lib/brand.ts` — `getModelBrand()` 从 modelId 前缀推断品牌名，隐藏 qiniu 上游
- API 路由 `providerName` 改用品牌映射，providers 列表从 modelId 推断
- 91 个模型分为 5 类: chat(59) / multimodal(14) / reasoning(12) / code(5) / image(1)
- 模型广场新增 Playground + 对话 跳转按钮，支持 `?model=` URL query
- 营销页更新: 90+ 模型、13+ 供应商、最新模型名称
- 线上验证: 14 个品牌正确显示，无 qiniu 泄露

**测试用 Dezix API Key:**
`sk-dezix-0afa2d524f6b04a6eeabdbdcbb6e33cf6e2a5f2392aeeb96`

**七牛云 API Key:**
`sk-d08a4b67a1c5f82b5162661919ad7e981eaf2a5896012a28efbbe66583025708`
Base URL: `https://api.qnaigc.com/v1`

**Supabase 直连串 (seed 脚本用):**
`postgresql://postgres:DezixAI2026db@db.kkwawbsibpgdqqdirbmv.supabase.co:5432/postgres`
注意: pooler 连接串 (`aws-0-ap-southeast-2.pooler.supabase.com`) 报 "Tenant or user not found"，直连可用

### 线上测试账号
- **普通用户**: `testuser1@dezix.ai` / `TestPass123456` (余额 100)
- **管理员**: `admin@dezix.ai` / `AdminPass123456` (ADMIN 角色)

### 基础设施信息
- **Supabase**: 项目 ref `kkwawbsibpgdqqdirbmv`, Region `ap-southeast-2` (Sydney), DB 密码 `DezixAI2026db`
- **Upstash**: REST URL `https://calm-collie-29219.upstash.io`
- **Supabase 连接注意**: 直连 5432 端口从国内不可达，用 Session mode pooler (pooler 主机 + 5432) 替代；连接串不要加 `sslmode=require`，SSL 由 pg Pool 的 `ssl: { rejectUnauthorized: false }` 处理

### 其他备注
- 本地开发仍可使用 Docker: `docker compose up -d` (PG + Redis)
- Windows 下 npx 有 PATH 问题，可用 `node node_modules/next/dist/bin/next dev`
- 前端展示页视觉效果待后续优化（用户已提出）
- Vercel 部署命令: `npx vercel --prod --yes` (Vercel CLI 已链接项目)
- seed 执行需指定直连串: `DATABASE_URL="postgresql://postgres:DezixAI2026db@db.kkwawbsibpgdqqdirbmv.supabase.co:5432/postgres" npx prisma db seed`

### Phase 14: i18n 多语言支持 — 进度记录

**技术方案**: `next-intl` v4.8.3, App Router, URL prefix (`localePrefix: "as-needed"`)
- 中文无前缀 (`/dashboard`), 英文有前缀 (`/en/dashboard`)
- IP 检测: `x-vercel-ip-country` header, CN → zh, 其他 → en
- Cookie `NEXT_LOCALE` 记住用户偏好

**已完成的步骤:**

| 步骤 | 状态 | 说明 |
|------|------|------|
| Step 1: 基础设施 | ✅ 完成 | next-intl 已安装, `src/i18n/{routing,request,navigation}.ts` 已创建, `next.config.ts` 加 plugin, `middleware.ts` 重写 (IP 检测 + next-intl + NextAuth), `auth.config.ts` 更新 (剥离 locale 前缀) |
| Step 2: 目录重构 | ✅ 完成 | 5 个路由组移入 `src/app/[locale]/`, root layout 精简, `[locale]/layout.tsx` 新建 (NextIntlClientProvider + generateMetadata) |
| Step 3a: 导航+通用组件 | ✅ 完成 | 7 个文件已改: console-sidebar, console-header, admin-sidebar, admin-header, marketing-header, marketing-footer, docs-sidebar |
| Step 3b: 认证页面 | ❌ 未完成 | login/page.tsx, register/page.tsx, oauth-buttons.tsx 需要改 |
| Step 3c: 营销页面 | ❌ 未完成 | hero, features, pricing, cta, models-showcase, providers-bar, stats-bar, 4 个营销 page |
| Step 3d: 控制台页面 | ❌ 未完成 | 10 个控制台页面 |
| Step 3e: 管理后台页面 | ❌ 未完成 | 5 个管理页面 |
| Step 3f: 文档页面 | ❌ 未完成 | 4 个文档页面 |
| Step 3g: API 错误码 | ❌ 未完成 | ~15 个 API 路由的中文错误消息改为错误码 |
| Step 4: 语言切换器 | ❌ 未完成 | `language-switcher.tsx` 组件 + 放置到 3 个 Header |
| Step 5: 构建验证 | ❌ 未完成 | `npm run build` + 日期格式修复 |

**已创建的文件:**
- `src/i18n/routing.ts` — defineRouting (zh 默认, en)
- `src/i18n/request.ts` — getRequestConfig
- `src/i18n/navigation.ts` — createNavigation (Link, useRouter, usePathname, redirect)
- `src/messages/zh.json` — ~400 个中文翻译字符串 (所有命名空间已定义)
- `src/messages/en.json` — 完整英文翻译
- `src/app/[locale]/layout.tsx` — 带 NextIntlClientProvider 的 locale layout

**每个文件改动模式 (供继续工作参考):**
- Client Component: `import { useTranslations } from "next-intl"` → `const t = useTranslations("Namespace")`
- `import Link from "next/link"` → `import { Link } from "@/i18n/navigation"`
- `import { usePathname, useRouter } from "next/navigation"` → `import { usePathname, useRouter } from "@/i18n/navigation"`
- 注意: `useSearchParams` 保持从 `next/navigation` 导入 (next-intl 不提供)
- 中文字符串替换为 `t("key")` 或 `t("key", { param: value })` 形式
- 翻译 key 在 `src/messages/zh.json` 中已全部预定义好

**继续工作指令:**
> 继续 Phase 14 i18n 工作，从 Step 3b (认证页面) 开始。翻译 key 已在 messages JSON 中定义好，需要逐个文件替换中文字符串为 `useTranslations` 调用。

## 跨会话继续开发

新会话启动后，告诉 Claude:
> 读一下 PROGRESS.md，继续上次的工作
