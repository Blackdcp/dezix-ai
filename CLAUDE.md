# CLAUDE.md — Dezix AI 项目指南

> Claude 每次启动时自动读取此文件，了解项目上下文。

## 项目简介

Dezix AI 是一个统一 LLM API 网关平台（仿 n1n.ai），面向国内开发者，一个 API Key 访问多个 AI 模型。

## 当前状态

**Phase 1-12, 14-15 全部完成。Bug 修复轮已完成。Provider Logo SVG + i18n + 橙色配色已上线。项目处于生产就绪状态。**

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
| Phase 11: 微信收款码充值 + 管理员审核 | ✅ 完成 | `783e6e7` |
| Phase 12: 模型管理增强 (上游同步 + 批量调价) | ✅ 完成 | `2d20d7d` |
| Phase 14: 多语言支持 (i18n) | ✅ 完成 | — |
| Phase 15: 前端视觉重构 | ✅ 完成 | `bf2946e` |

## 技术栈

| 层 | 技术 |
|---|---|
| 前后端 | Next.js 16 (App Router) + TypeScript |
| 数据库 | Supabase PostgreSQL (Prisma ORM 7 + PrismaPg driver adapter + PgBouncer) |
| 缓存/限流 | Upstash Redis (@upstash/redis HTTP) + @upstash/ratelimit |
| 认证 | NextAuth.js v5 (beta) + Credentials + GitHub OAuth + Google OAuth |
| UI | Tailwind CSS v4 + shadcn/ui |
| 国际化 | next-intl v4.8.3 (zh 默认 + en, IP 自动检测) |
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

1. **多语言 UI (i18n)** — `next-intl` 管理中英文，`useTranslations("Namespace")` 调用翻译
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
- **最新上线 commit: `3a269e2`** — SVG provider logos + brand i18n + Brand Orange 配色 + displayName 全英文

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
- **Brand key 为英文标识符** (ByteDance/Alibaba/Zhipu/Moonshot/Xiaomi/Meituan/StepFun/Kling 等)
- 前端通过 `useTranslations("Providers")` 翻译显示名 (zh: 字节跳动, en: ByteDance)
- API 路由 `providerName` 返回英文 key，前端负责 i18n 翻译
- 91 个模型分为 5 类: chat(59) / multimodal(14) / reasoning(12) / code(5) / image(1)
- 模型广场新增 Playground + 对话 跳转按钮，支持 `?model=` URL query
- 营销页更新: 90+ 模型、13+ 供应商、最新模型名称

### Provider Logo (内联 SVG, 2026-03-01 更新)
- `src/components/icons/provider-logos.tsx` — 16 个内联 SVG React 组件 (不再使用 PNG)
- `getProviderLogo(name)` 返回 `{ Logo, color }`, 用法: `<Logo className="h-3 w-3" style={{ color }} />`
- 官方 SVG (CC0): OpenAI, Anthropic, Google/Gemini, ByteDance, Alibaba, Xiaomi, Meituan
- 几何 fallback: DeepSeek, xAI, Zhipu, Moonshot, MiniMax, StepFun, Kling, OpenRouter, Vidu

### 配色方案 (已上线, commit `3a269e2`)
- `globals.css` 配色已从 Electric Blue (#0070F3) 切换为 Brand Orange (#F26522)
- 线上已部署橙色方案
- 切换配色只需修改 `globals.css` 中的 CSS 变量

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

### Phase 14: i18n 多语言支持 (已完成 ✅)

**技术方案**: `next-intl` v4.8.3, App Router, URL prefix (`localePrefix: "as-needed"`)
- 中文无前缀 (`/dashboard`), 英文有前缀 (`/en/dashboard`)
- IP 检测: `x-vercel-ip-country` header, CN → zh, 其他 → en
- Cookie `NEXT_LOCALE` 记住用户偏好
- 语言切换器: 营销 Header + 控制台 Header + 管理 Header

**关键文件:**
- `src/i18n/routing.ts` — defineRouting (zh 默认, en)
- `src/i18n/request.ts` — getRequestConfig (显式 switch-case, 兼容 Turbopack)
- `src/i18n/navigation.ts` — createNavigation (Link, useRouter, usePathname, redirect)
- `src/messages/zh.json` — ~400 个中文翻译字符串
- `src/messages/en.json` — 完整英文翻译
- `src/app/[locale]/layout.tsx` — NextIntlClientProvider + 动态 metadata
- `src/components/layout/language-switcher.tsx` — 语言切换下拉组件
- `src/middleware.ts` — IP 地理检测 + next-intl + NextAuth 组合

**开发模式:**
- Client Component: `import { useTranslations } from "next-intl"` → `const t = useTranslations("Namespace")`
- `import Link from "next/link"` → `import { Link } from "@/i18n/navigation"`
- `import { usePathname, useRouter } from "next/navigation"` → `import { usePathname, useRouter } from "@/i18n/navigation"`
- 注意: `useSearchParams` 保持从 `next/navigation` 导入 (next-intl 不提供)
- API 路由返回错误码 (如 `EMAIL_ALREADY_EXISTS`)，前端用 `useTranslations("Errors")` 翻译

### Phase 12: 模型管理增强 — 上游同步 + 批量调价 (已完成 ✅)

**功能**: 管理员一键从七牛云上游拉取最新模型列表，自动发现新增/下线模型；海外模型标记为 `isManual` 不受同步影响；批量选中模型调价。

**关键文件:**
- `prisma/schema.prisma` — Model 表新增 `isManual Boolean @default(false)` 字段
- `src/lib/sync-models.ts` — 同步引擎 (fetchUpstreamModels, inferModelDefaults, syncUpstreamModels)
- `src/app/api/admin/models/sync/route.ts` — GET 预览同步 (dry run) / POST 执行同步
- `src/app/api/admin/models/batch-price/route.ts` — POST 批量更新定价
- `src/lib/validations/admin.ts` — 新增 `adminBatchPriceSchema`
- `src/app/[locale]/(admin)/admin/models/page.tsx` — 同步按钮 + 预览弹窗 + 复选框 + 批量调价弹窗 + isManual 徽章

**数据库状态:**
- Schema 已 push 到 Supabase (`isManual` 字段已添加)
- 35 个海外模型 (openai/, claude-, gemini-, x-ai/) 已标记 `isManual=true`
- 其余 56 个国内模型 `isManual=false`，可通过同步自动管理

**同步逻辑:**
1. 调用上游 `/v1/models` API 获取公开模型列表
2. 与 DB 中 `isManual=false` 的模型比较
3. 新模型 → 自动推断 displayName/category/定价/maxContext 后创建
4. 上游下线的模型 → 标记 `isActive=false`（不删除）
5. 更新渠道 models[] = 所有 isActive 模型的 modelId

**待部署:** 代码已 commit (`2d20d7d`)，需 `git push` 到 GitHub 触发 Vercel 部署

## 跨会话继续开发

新会话启动后，告诉 Claude:
> 读一下 PROGRESS.md，继续上次的工作

### Phase 15: 前端视觉重构 (已完成 ✅)

所有功能开发已完成 (Phase 1-12, 14)，Phase 13 监控告警不做。
Phase 15 前端视觉重构已全部完成。

**配色方案: Electric Blue × Vivid Cyan (方案 C)**
- 主色: `#0070F3` (Electric Blue, Vercel 级科技蓝)
- 渐变: `#0070F3 → #00B4D8` (电光蓝→活力青)
- 背景: `#FAF9F6` (Cloud Dancer 2026 潘通暖白)
- CSS 变量: globals.css 集中管理, .tsx 文件使用 Tailwind 变量类 (text-primary, text-foreground, border-border 等)

**已完成的视觉改动:**
- Logo 移除: 6 处 D/A 图标全部移除, 改为纯文字 "Dezix AI"
- Provider 品牌 SVG logos: OpenAI, Anthropic, Google, DeepSeek, xAI (正确官方 SVG)
- Hero: 暗色代码预览, badge 标签, 紧凑标题
- Features: h-7 w-7 大图标, 渐变色卡片背景, 改进文字对比度
- Pricing: "Most Popular" 徽章, overflow-hidden, CTA 按钮底部对齐
- CTA: 暗色背景 (#1C1917) + 蓝光径向渐变装饰
- Models Showcase: 骨架屏加载, 可点击卡片, 价格格式化
- Model List: overflow-x-auto, sticky header, 复制 model ID 按钮
- Dashboard: 品牌色图表, 彩色统计图标 + 背景色块, 骨架屏
- Console Models: 绿色 Active 徽章, provider logos, hover 阴影
- Auth 页面: dot-grid 背景, gradient-brand 顶线, ring focus 样式
- Marketing Header: 活动导航 pill (bg-primary/10 + text-primary)
- CSS 变量重构: 25 个文件硬编码 hex → Tailwind CSS 变量类

**关键 commits:**
- `8c203b7` — Phase 15 基础视觉升级
- `ae5e630` — Cloud Dancer 暖白 + 正确 provider SVG logos
- `c67a027` — Electric Blue #0070F3 配色方案
- `bf2946e` — CSS 变量重构 + feature 图标优化
- `13f510d` — Bug 修复轮 (4 CRITICAL + 3 HIGH + 2 MEDIUM + ESLint)

**关键文件:**
- `src/app/globals.css` — 全局配色 (CSS 变量 + 工具类)
- `src/components/icons/provider-logos.tsx` — 5 个品牌 SVG + GenericProviderLogo
- `src/components/marketing/` — 7 个营销组件 (hero, features, providers-bar, pricing, models-showcase, stats-bar, cta)
- `src/components/layout/` — 8 个布局组件 (header/footer/sidebar)

### Bug 修复轮 (已完成 ✅, commit `13f510d`)

**修复的严重 Bug:**
1. **流式扣费幂等** — `billing.ts` 扣费前查 referenceId 防止重复扣费
2. **推荐返佣竞态** — `referral.ts` 用 UPDATE...RETURNING 原子化余额+记录
3. **充值审批双重到账** — `approve/route.ts` 用 RETURNING 原子化订单状态+余额
4. **OAuth 账号接管** — `auth.ts` 移除 allowDangerousEmailAccountLinking
5. **Gateway JSON.parse 崩溃** — `gateway/auth.ts` try-catch + 删脏缓存回退 DB
6. **管理员余额竞态** — `balance/route.ts` UPDATE...RETURNING
7. **邮箱修改竞态** — `settings/route.ts` 捕获 Prisma P2002
8. **流式超时** — `stream.ts` 5 分钟超时保护
9. **ESLint** — 全部修复 (0 error, 0 warning)

**验证:** ESLint 0 问题 / Build 0 错误 / 67 测试全通过

### CI/部署修复 (已完成 ✅, commit `66c8feb`)

**问题**: 每次 push 到 GitHub，CI 在 `npm ci` 步骤立即失败 (6秒)；Vercel 部署全部 Canceled。
**根因**:
1. 本地 Node 24 / npm 11.6 生成的 `package-lock.json` 与 CI 的 Node 20 (npm 10.x) 不兼容
2. Vercel Dashboard 启用了 "Require Verified Commits"，拒绝未 GPG 签名的 commit

**修复**:
- CI workflow Node 20 → 24，匹配本地 npm 版本
- `.nvmrc` 设为 `24`，Vercel 使用正确 Node 版本
- `package.json` 添加 `"engines": { "node": ">=24.0.0" }`
- Vercel Dashboard 关闭 "Require Verified Commits"

**验证:** CI 全部通过 (lint → tsc → test → build)
