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
- [ ] Dashboard 页面: 余额、今日消费、请求数、趋势图
- [ ] API Key CRUD: 创建/删除/禁用
- [ ] 子 Key 权限: 额度上限、过期时间、模型白名单
- [ ] Git commit: "Phase 3: API Key 管理 + Dashboard"

---

## Phase 4: 用量统计 + 模型市场 + Playground
- [ ] 用量统计页 (按模型/按日/日期范围筛选)
- [ ] 模型市场 (卡片网格、搜索筛选、定价展示)
- [ ] API Playground (请求构建器 + 流式响应 + 代码片段生成)
- [ ] Git commit: "Phase 4: 用量统计 + 模型市场 + Playground"

---

## Phase 5: 充值计费 + 聊天界面
- [ ] 余额充值 (支付宝/微信/开发沙箱)
- [ ] 交易记录页
- [ ] 类 ChatGPT 聊天界面 (流式、Markdown、代码高亮)
- [ ] 用户设置页
- [ ] Git commit: "Phase 5: 充值计费 + 聊天界面"

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
