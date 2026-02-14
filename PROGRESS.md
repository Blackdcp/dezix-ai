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
- [ ] 首页 (Hero、功能展示、模型展示、CTA)
- [ ] 公开模型列表页、定价页、FAQ
- [ ] MDX 文档站 (快速开始、API 参考、SDK 示例)
- [ ] 全中文 UI
- [ ] Git commit: "Phase 6: 营销官网 + 文档站"

---

## Phase 7: 管理后台 + 推荐返佣
- [ ] 管理员 Dashboard (收入、成本、利润)
- [ ] 用户管理、模型管理、渠道管理
- [ ] 请求日志查看器
- [ ] 推荐返佣系统 (邀请链接 + 充值返佣)
- [ ] Git commit: "Phase 7: 管理后台 + 推荐返佣"

---

## Phase 8: 生产加固
- [ ] Zod 输入验证
- [ ] API Key 加密存储、安全头、CORS
- [ ] IP 限流、健康检查端点
- [ ] 单元测试 + 集成测试 (Vitest)
- [ ] 生产级 Docker 配置
- [ ] CI Pipeline
- [ ] Git commit: "Phase 8: 生产加固"
