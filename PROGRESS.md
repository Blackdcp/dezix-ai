# PROGRESS.md — Dezix AI 开发进度

> 每完成一项即打勾，新会话读取此文件继续工作。

---

## Phase 1: 项目基础设施

### 已完成
- [x] Next.js 16 项目初始化 (TypeScript + Tailwind CSS v4 + App Router)
- [x] 安装核心依赖 (Prisma, NextAuth v5 beta, bcryptjs, ioredis, lucide-react)
- [x] shadcn/ui 初始化 (已 init，`src/lib/utils.ts` 已生成)
- [x] 添加 shadcn/ui 组件 (button, input, label, card, separator, avatar, dropdown-menu, sheet)
- [x] 创建 `.env.example` 和 `.env.local`
- [x] 创建 `docker-compose.yml` (PostgreSQL 16 + Redis 7)
- [x] 创建 `Dockerfile` (多阶段构建，standalone 模式)
- [x] 创建 `prisma/schema.prisma` (12 张表) + `prisma.config.ts` (Prisma 7 新格式)
- [x] 运行 `npx prisma generate` (migrate dev 需要数据库运行后执行)
- [x] 安装 `@prisma/adapter-pg` + `pg` (Prisma 7 需要 driver adapter)
- [x] 创建 `src/lib/db.ts` — Prisma 客户端单例 (使用 PrismaPg adapter)
- [x] 创建 `src/lib/redis.ts` — Redis 客户端
- [x] 创建 `src/lib/auth.ts` — NextAuth 配置 (Credentials Provider, 邮箱+密码)
- [x] 创建 `src/app/api/auth/[...nextauth]/route.ts`
- [x] 创建 `src/app/(auth)/login/page.tsx` — 登录页
- [x] 创建 `src/app/(auth)/register/page.tsx` — 注册页
- [x] 创建 `src/app/api/register/route.ts` — 注册 API
- [x] 创建 `src/components/layout/console-sidebar.tsx` — 侧边栏
- [x] 创建 `src/components/layout/console-header.tsx` — 顶栏
- [x] 创建 `src/app/(console)/layout.tsx` — 控制台布局
- [x] 创建 `src/app/(console)/dashboard/page.tsx` — Dashboard 占位页
- [x] 创建 `src/middleware.ts` — 路由保护中间件
- [x] `npm run build` 验证通过

### 基础设施验证 (本次会话完成)
- [x] 安装 Docker Desktop，运行 `docker compose up -d` 启动 PostgreSQL + Redis
- [x] 运行 `prisma db push` 创建数据库表 (12 张表全部创建成功)
- [x] 安装 lightningcss 原生模块修复 Windows 构建问题
- [x] `npm run build` 验证通过
- [x] 验证注册: `POST /api/register` → `{"message":"注册成功"}`
- [x] 验证登录: NextAuth credentials 登录 → 302 重定向
- [x] 验证 Session: `/api/auth/session` 返回用户信息
- [x] 数据库有测试用户: test@example.com / test12345678

### 品牌重命名 (myapi → Dezix AI)
- [x] 确定品牌名: **Dezix AI**
- [x] `package.json` name: `myapi` → `dezix-ai`
- [x] `docker-compose.yml`: 容器名 `dezix-postgres` / `dezix-redis`，数据库凭据 `dezix`，stack name `dezix-ai`
- [x] `prisma/schema.prisma`: API Key 前缀注释 `sk-dezix-`
- [x] `src/app/layout.tsx`: 页面标题 → `Dezix AI — 统一 AI 模型网关`
- [x] `src/components/layout/console-sidebar.tsx`: Logo 文字 → `Dezix AI`
- [x] `src/app/(auth)/login/page.tsx`: 登录标题 → `登录 Dezix AI`
- [x] `src/app/(auth)/register/page.tsx`: 注册标题 → `注册 Dezix AI`
- [x] `src/app/(console)/dashboard/page.tsx`: 快速开始描述 → `Dezix AI`
- [x] `CLAUDE.md` / `PROGRESS.md`: 项目文档全部更新
- [x] `.env.example` / `.env.local`: DATABASE_URL + APP_NAME 更新
- [x] `package-lock.json`: `npm install` 自动更新
- [x] 项目文件夹: `E:\Claude code\myapi\myapi` → `E:\Claude code\dezix-ai`
- [x] Docker: 旧容器/网络/卷全部清除，用新名字重建
- [x] 数据库: `prisma db push` 到新 `dezix` 库，12 张表同步完成
- [x] `npm run build` 验证通过
- [x] 文件内容 + Docker 资源零 `myapi` 残留

### Phase 1 剩余
- [x] Git init + commit: "Phase 1: 项目基础设施 + 品牌命名 Dezix AI"

### 下次启动备注
- 项目路径: `E:\Claude code\dezix-ai`
- Docker Desktop 需手动启动，然后在项目目录执行 `docker compose up -d`
- Docker stack 名: `dezix-ai`，容器: `dezix-postgres` / `dezix-redis`
- 数据库: PostgreSQL 用户 `dezix`，密码 `dezix_password`，库名 `dezix`
- 数据库当前是空的（重建后未注册用户），需要重新注册测试用户
- 开发服务器: `node node_modules/next/dist/bin/next dev` (Windows 下 npx 有 PATH 问题)
- Prisma 命令: `node node_modules/prisma/build/index.js <command>` (需设置 DATABASE_URL 环境变量)
- Next.js 16 警告 middleware 已废弃需迁移为 proxy (非阻塞，Phase 1 可忽略)
- 下一步: git init + commit Phase 1，然后开始 Phase 2 核心 API 网关引擎

---

## Phase 2: 核心 API 网关引擎
- [x] `POST /api/v1/chat/completions` (流式 + 非流式)
- [x] `GET /api/v1/models`
- [x] API Key 鉴权 (Bearer token)
- [x] Provider 适配器 (OpenAI, Anthropic, Google, DeepSeek)
- [x] 请求路由 + 渠道选择 (`src/lib/gateway/router.ts`)
- [x] SSE 流式转换器 (`src/lib/gateway/stream.ts`)
- [x] Token 计数 + 按请求扣费 (`src/lib/gateway/token-counter.ts`, `billing.ts`)
- [x] Redis 限流 (`src/lib/gateway/rate-limiter.ts`)
- [x] 上游故障自动 Fallback
- [x] 异步请求日志 (UsageLog)
- [x] 种子数据 (`prisma/seed.ts` — 模型 + 渠道)
- [x] 测试脚本 (`scripts/create-test-key.ts` — 创建测试 API Key)
- [x] 验证: curl 发送请求，验证流式响应和计费
- [x] Git commit: "Phase 2: API 网关引擎"

---

## Phase 3: API Key 管理 + 控制台 Dashboard

### 已完成
- [x] 安装依赖: recharts + shadcn/ui 组件 (dialog, table, badge, switch, select, sonner, checkbox, popover, command, tooltip)
- [x] 创建 `src/app/api/console/dashboard/route.ts` — GET 返回余额、今日消费/请求、活跃密钥数、7 日趋势
- [x] 创建 `src/app/api/console/api-keys/route.ts` — GET 列出所有 Key / POST 创建新 Key (sk-dezix-{48 hex}, SHA-256 哈希存储, 返回一次性明文)
- [x] 创建 `src/app/api/console/api-keys/[id]/route.ts` — PATCH 更新 Key 属性 / DELETE 删除 Key + 清除 Redis 缓存
- [x] 改造 `src/app/(console)/dashboard/page.tsx` — 改为 client component，4 个统计卡片 + 7 日 recharts AreaChart 双轴趋势图 + 快速开始
- [x] 创建 `src/app/(console)/api-keys/page.tsx` — 完整 CRUD: Table 列表 + 创建 Dialog (含密钥展示/复制) + 编辑 Dialog + 删除确认 Dialog + 启用/禁用 Switch
- [x] 更新 `src/app/(console)/layout.tsx` — 添加 Sonner Toaster 组件
- [x] `npm run build` 验证通过

### 待完成
- [x] Git commit: "Phase 3: API Key 管理 + Dashboard"
- [ ] 启动 Docker + dev server 进行功能验证（创建密钥、列表展示、编辑、删除、Dashboard 数据）

---

## Phase 4: 用量统计 + 模型市场 + Playground

### 已完成
- [x] 安装 shadcn/ui 组件: tabs, slider, textarea, scroll-area
- [x] 创建 `src/app/api/console/models/route.ts` — GET 返回模型列表 (search/category/provider 筛选, Provider 表映射, Decimal→Number)
- [x] 创建 `src/app/api/console/usage/route.ts` — GET 返回 summary + dailyTrends + modelBreakdown + recentLogs (日期范围/模型筛选)
- [x] 创建 `src/app/(console)/models/page.tsx` — 模型市场: 搜索栏 + 分类/供应商筛选 + 响应式卡片网格 + 定价展示 + 300ms 防抖搜索
- [x] 创建 `src/app/(console)/usage/page.tsx` — 用量统计: 日期预设/自定义 + 模型筛选 + 4 统计卡片 + AreaChart 趋势图 + BarChart 模型分布 + 日志表格
- [x] 创建 `src/app/(console)/playground/page.tsx` — Playground: 模型选择 + 消息编辑器 + 参数调节 (Temperature/TopP/MaxTokens/Stream) + API Key 输入 + 流式响应查看器 + 代码示例 (cURL/Python/Node.js)
- [x] `npm run build` 验证通过

### 待完成
- [x] Git commit: "Phase 4: 用量统计 + 模型市场 + Playground" (7017e5d)
- [ ] 启动 Docker + dev server 进行功能验证

---

## Phase 5: 充值计费 + AI 对话 + 用户设置

### 已完成
- [x] 安装依赖: react-markdown, remark-gfm, react-syntax-highlighter
- [x] 创建 `src/app/api/console/billing/route.ts` — GET 返回余额 + 交易记录分页
- [x] 创建 `src/app/api/console/billing/topup/route.ts` — POST 模拟充值 (原子 SQL + Transaction 记录)
- [x] 创建 `src/app/(console)/billing/page.tsx` — 余额卡片 + 预设/自定义充值 + 交易记录表格 + 分页
- [x] 创建 `src/app/api/console/settings/route.ts` — GET/PATCH 用户资料 (邮箱唯一性校验)
- [x] 创建 `src/app/api/console/settings/password/route.ts` — POST 修改密码 (bcrypt 验证旧密码 + hash 新密码)
- [x] 创建 `src/app/(console)/settings/page.tsx` — 个人信息 + 编辑资料 + 修改密码
- [x] 创建 `src/components/chat/markdown-renderer.tsx` — react-markdown + remark-gfm + react-syntax-highlighter (oneDark 主题, 语言标签, 复制按钮, GFM 表格/列表/引用)
- [x] 创建 `src/app/(console)/chat/page.tsx` — AI 对话: localStorage 持久化, 对话列表 (最多 50 条), 消息流 (最多 100 条/对话), 流式 SSE, 模型选择 + API Key, Markdown 渲染 + 代码高亮
- [x] 更新 `src/components/layout/console-sidebar.tsx` — 添加 /chat "AI 对话" 导航项 (Bot 图标)
- [x] 更新 `src/middleware.ts` — protectedPaths 添加 /chat
- [x] `npm run build` 验证通过

### 待完成
- [x] Git commit: "Phase 5: 充值计费 + AI 对话 + 用户设置"
- [ ] 启动 Docker + dev server 进行功能验证

---

## Phase 6: 营销官网 + 文档站

### 已完成
- [x] 创建 `src/app/api/public/models/route.ts` — 公开模型 API（无鉴权，强制 isActive: true，5 分钟缓存，不暴露成本价）
- [x] 删除 `src/app/page.tsx`（Next.js 默认模板）
- [x] 创建 `src/components/layout/marketing-header.tsx` — 营销头部（sticky，桌面导航 + 移动端 Sheet 汉堡菜单）
- [x] 创建 `src/components/layout/marketing-footer.tsx` — 营销底部（4 列 grid：品牌、产品、文档、关于）
- [x] 创建 `src/app/(marketing)/layout.tsx` — 营销布局（Header + children + Footer）
- [x] 创建 `src/components/marketing/hero-section.tsx` — Hero 区域（大标题 + CTA）
- [x] 创建 `src/components/marketing/providers-bar.tsx` — 供应商横条（OpenAI/Anthropic/Google/DeepSeek）
- [x] 创建 `src/components/marketing/features-section.tsx` — 6 个功能卡片
- [x] 创建 `src/components/marketing/models-showcase.tsx` — 热门模型展示（从 /api/public/models 获取）
- [x] 创建 `src/components/marketing/pricing-section.tsx` — 3 个定价方案预览
- [x] 创建 `src/components/marketing/stats-bar.tsx` — 数据统计条
- [x] 创建 `src/components/marketing/cta-section.tsx` — 底部 CTA
- [x] 创建 `src/app/(marketing)/page.tsx` — 首页（组合 7 个 section）
- [x] 创建 `src/app/(marketing)/model-list/page.tsx` — 公开模型列表（Table + 搜索 + 分类筛选）
- [x] 创建 `src/app/(marketing)/pricing/page.tsx` — 定价页（方案卡片 + 模型定价表）
- [x] 创建 `src/app/(marketing)/faq/page.tsx` — FAQ 页（自定义折叠组件，8 个条目）
- [x] 创建 `src/components/docs/code-block.tsx` — 代码块组件（react-syntax-highlighter + oneDark + 复制按钮）
- [x] 创建 `src/components/layout/docs-sidebar.tsx` — 文档侧边栏（active link 模式）
- [x] 创建 `src/app/(docs)/layout.tsx` — 文档布局（MarketingHeader + DocsSidebar + content）
- [x] 创建 `src/app/(docs)/docs/page.tsx` — 文档首页（重定向 /docs/quick-start）
- [x] 创建 `src/app/(docs)/docs/quick-start/page.tsx` — 快速开始（注册 → Key → 请求 + Python/Node.js/cURL 示例）
- [x] 创建 `src/app/(docs)/docs/api-reference/page.tsx` — API 参考（认证、Chat Completions、Models、错误码、流式）
- [x] 创建 `src/app/(docs)/docs/sdk-examples/page.tsx` — SDK 示例（Python/Node.js/cURL 多场景示例）
- [x] 更新 `src/app/layout.tsx` — SEO 增强（Open Graph、Twitter Card、keywords、robots）
- [x] 全中文 UI
- [x] `npm run build` 验证通过

### 待完成
- [x] Git commit: "Phase 6: 营销官网 + 文档站"
- [ ] 启动 Docker + dev server 进行功能验证

---

## Phase 7: 管理后台 + 推荐返佣

### Auth 角色支持
- [x] 创建 `src/types/next-auth.d.ts` — Session/JWT 类型扩展加 role 字段
- [x] 修改 `src/lib/auth.ts` — authorize 返回 role，JWT/session callback 传递 role
- [x] 修改 `src/middleware.ts` — protectedPaths 加 /referral 和 /admin，ADMIN 角色检查
- [x] 创建 `src/lib/admin.ts` — requireAdmin() 复用鉴权函数

### 管理后台布局
- [x] 创建 `src/components/layout/admin-sidebar.tsx` — 管理后台侧边栏（5 个导航项）
- [x] 创建 `src/components/layout/admin-header.tsx` — 管理后台顶栏（返回控制台链接）
- [x] 创建 `src/app/(admin)/layout.tsx` — 管理后台布局

### 管理后台 API（9 个路由）
- [x] `GET /api/admin/dashboard` — 平台统计（用户数、收入/成本/利润、30 天趋势）
- [x] `GET /api/admin/users` — 用户列表（分页 + 搜索 + 角色筛选）
- [x] `GET/PATCH /api/admin/users/[id]` — 用户详情/编辑角色
- [x] `POST /api/admin/users/[id]/balance` — 原子 SQL 调整余额 + ADMIN 交易记录
- [x] `GET/POST /api/admin/models` — 模型列表/创建（modelId 唯一验证）
- [x] `PATCH/DELETE /api/admin/models/[id]` — 模型编辑/删除
- [x] `GET/POST /api/admin/channels` — 渠道列表（apiKey 脱敏）/创建
- [x] `PATCH/DELETE /api/admin/channels/[id]` — 渠道编辑（空 apiKey 不覆盖）/删除
- [x] `GET /api/admin/logs` — 全平台请求日志（userId/modelId/status/日期筛选 + 分页）

### 管理后台页面（5 个页面）
- [x] `/admin/dashboard` — 6 统计卡片 + 30 天 AreaChart（收入/成本/请求）
- [x] `/admin/users` — 用户表格 + 搜索 + 角色筛选 + 调整余额 Dialog + 角色切换
- [x] `/admin/models` — 模型表格 + 新增/编辑 Dialog + isActive Switch + 删除确认
- [x] `/admin/channels` — 渠道表格 + 新增/编辑 Dialog + isActive Switch + 删除确认
- [x] `/admin/logs` — 筛选栏 + 日志表格 + 分页

### 推荐返佣系统
- [x] 修改 `src/app/api/register/route.ts` — 支持 referralCode，新用户自动生成推荐码
- [x] 修改 `src/app/(auth)/register/page.tsx` — 读取 ?ref= 参数传给注册 API
- [x] 修改 `src/app/api/console/billing/topup/route.ts` — 充值后按比例返佣（默认 10%，从 SystemConfig 读取）
- [x] 创建 `GET /api/console/referral` — 推荐码 + 统计 + 收益列表
- [x] 创建 `POST /api/console/referral/generate` — 为老用户生成推荐码
- [x] 创建 `/referral` — 推荐链接 + 复制 + 统计卡片 + 收益表格

### 控制台侧边栏更新
- [x] 修改 `src/components/layout/console-sidebar.tsx` — 加"推荐返佣"（Gift 图标）+ ADMIN 底部"管理后台"入口

### 验证
- [x] `npm run build` 通过（46 路由全部编译成功）
- [x] Git commit: "Phase 7: 管理后台 + 推荐返佣"

---

## Phase 8: 生产加固
- [x] Zod 输入验证 (15 个路由 + 6 个 schema 文件)
- [x] API Key 加密存储 (AES-256-GCM)、安全头 (HSTS/X-Frame-Options/CSP)、CORS
- [x] IP 限流 (注册 5/min, Completions 60/min, Models 30/min)、健康检查端点 (/api/health)
- [x] 单元测试 + 集成测试 (Vitest, 7 个测试文件, 68 个测试用例)
- [x] 生产级 Docker 配置 (tini PID 1, healthcheck, memory limits, Redis AOF+LRU)
- [x] CI Pipeline (.github/workflows/ci.yml: lint → tsc → test → build)
- [x] Git commit: "Phase 8: 生产加固"
