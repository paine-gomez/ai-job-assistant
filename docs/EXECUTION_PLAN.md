# 执行计划文档

## 总体策略

分 6 步执行，每步完成后验证，验证通过并经用户确认后再进入下一步。
每一步聚焦单一目标，降低出错率，保证项目稳定推进。

---

## Step 0: 搭建文档体系

**目标：** 建立项目骨架，所有规范文件就位

**任务清单：**
- [ ] 创建目录结构（docs/, dev-logs/）
- [ ] 编写 CLAUDE.md（项目指引）
- [ ] 编写 docs/REQUIREMENTS.md（需求规格）
- [ ] 编写 docs/TECH_STACK.md（技术选型）
- [ ] 编写 docs/DESIGN_SPEC.md（设计规范）
- [ ] 编写 docs/EXECUTION_PLAN.md（本文件）
- [ ] 创建 task_plan.md、progress.md、findings.md
- [ ] 创建 dev-logs/2026-06-07.md

**验证标准：** 所有文件存在且内容完整，文件路径在 CLAUDE.md 中索引正确

---

## Step 1: 项目脚手架

**目标：** 初始化 Next.js 项目，安装依赖，配置工具链，Git 初始化

**前提：** Node.js 已安装（已确认 v24.16.0）

**任务清单：**
- [ ] `git init` + 创建 `.gitignore`
- [ ] 用 `create-next-app` 初始化项目（Next.js 15）
- [ ] 安装额外依赖（prisma, supabase, ai, pdfjs-dist, mammoth 等）
- [ ] 初始化 shadcn/ui（按需引入组件）
- [ ] 创建 `.env.local` 和 `.env.local.example` 模板文件
- [ ] 配置 Tailwind（颜色、字体）
- [ ] 完成首次 `git commit`
- [ ] 测试 `npm run dev` 能否启动

**验证标准：** 浏览器打开 `http://localhost:3000` 看到 Next.js 欢迎页

---

## Step 2: 数据库

**目标：** 创建 Supabase 项目，定义数据表结构

**前提：** 已注册 Supabase 账号并创建项目

**任务清单：**
- [ ] 获取 Supabase 项目连接字符串
- [ ] 配置 `.env.local` 中的 DATABASE_URL
- [ ] 编写 `prisma/schema.prisma`（Document + Chunk 表）
- [ ] 执行 `npx prisma db push` 创建表
- [ ] 生成 Prisma Client
- [ ] 用 Prisma Studio 验证表结构
- [ ] `git commit` 保存数据库变更

**验证标准：** Prisma Studio 中能看到 Document 和 Chunk 表，字段正确

---

## Step 3: 核心服务层

**目标：** 编写可复用的服务模块

**任务清单：**
- [ ] `lib/prisma.ts` — Prisma 客户端单例
- [ ] `lib/supabase.ts` — Supabase 客户端（含 Storage）
- [ ] `lib/ai.ts` — AI SDK 配置（@ai-sdk/openai + DeepSeek）
- [ ] `lib/document-parser.ts` — PDF/Word/TXT 解析
- [ ] `lib/api-response.ts` — 统一 API 响应格式
- [ ] `types/index.ts` — 共享类型定义
- [ ] 逐个测试每个模块能否正常导入
- [ ] `git commit` 保存服务层代码

**验证标准：** 所有模块导入无报错，解析服务能正确提取文本

---

## Step 4: API 端点

**目标：** 实现所有后端接口

**任务清单：**

知识库模块：
- [ ] `POST /api/knowledge/upload` — 上传文件，解析，存储
- [ ] `POST /api/knowledge/query` — 流式问答
- [ ] `GET /api/knowledge/documents` — 文档列表
- [ ] `DELETE /api/knowledge/documents/[id]` — 删除文档

JD 分析模块：
- [ ] `POST /api/jd/analyze` — JD 结构化分析

简历匹配模块：
- [ ] `POST /api/match` — 简历 + JD 匹配评分

**验证标准：** 每个端点用 curl 测试，返回预期结构和内容（统一使用 `{ success, data, error }` 响应格式）

---

## Step 5: 前端页面

**目标：** 实现所有前端页面和组件

**任务清单：**
- [ ] Layout 组件（Navbar + Footer）
- [ ] 首页（Hero + 功能卡片）
- [ ] 知识库问答页面（文档上传 + 对话）
- [ ] 工具页（JD 分析 Tab + 简历匹配 Tab）
- [ ] 所有 shadcn/ui 组件引入
- [ ] `git commit` 保存前端代码

**验证标准：** 浏览器中完整体验三个功能全流程

---

## Step 6: 收尾打磨

**目标：** 处理边界情况，完善体验

**任务清单：**
- [ ] 空状态引导（无文档、无对话时）
- [ ] 错误处理（网络错误、API 错误、文件格式错误 → 统一用 sonner Toast）
- [ ] 加载状态（按钮 loading、AI 思考动画）
- [ ] Toast 通知（成功/失败/警告，用 sonner 库）
- [ ] 文件大小（≤5MB）和格式校验
- [ ] 统一 API 错误响应格式验证
- [ ] 更新开发日志
- [ ] 最终全流程测试
- [ ] 最终 `git commit`

**验证标准：** 所有边界情况有合理提示，无崩溃或白屏

---

## 时间估算

| Step | 预计时间 | 累积时间 |
|------|---------|---------|
| Step 0 | 30分钟 | 30分钟 |
| Step 1 | 30分钟 | 1小时 |
| Step 2 | 30分钟 | 1.5小时 |
| Step 3 | 1小时 | 2.5小时 |
| Step 4 | 2小时 | 4.5小时 |
| Step 5 | 2小时 | 6.5小时 |
| Step 6 | 30分钟 | 7小时 |
