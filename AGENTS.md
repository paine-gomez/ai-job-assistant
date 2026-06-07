# AI求职助手 — AI 助手指引

## 项目概述

为大四应届生曹嘉明（AI产品经理方向）构建 AI 求职助手 Web 应用。
全栈代码构建，三大功能模块：知识库问答、JD 分析工具、简历匹配工作流。

---

## 关键文件路径

| 用途 | 路径 |
|------|------|
| 📋 需求规格 | [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) |
| 🔧 技术选型 | [docs/TECH_STACK.md](docs/TECH_STACK.md) |
| 🎨 设计规范 | [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md) |
| 📝 执行计划 | [docs/EXECUTION_PLAN.md](docs/EXECUTION_PLAN.md) |
| 📅 开发日志 | [dev-logs/](dev-logs/) |
| 📊 任务总览 | [task_plan.md](task_plan.md) |
| 📈 进度追踪 | [progress.md](progress.md) |
| 🔍 发现记录 | [findings.md](findings.md) |

---

## 工作原则

1. **逐步执行** — 每完成一个步骤需用户确认后再继续，不要连续执行多个步骤
2. **每日日志** — 每天工作完成后更新 `dev-logs/YYYY-MM-DD.md`，记录完成事项和待办事项
3. **先读规范再动手** — 每次操作前，阅读相关设计文档确认规范
4. **通俗解释** — 用户不懂代码，技术操作和结果需用通俗语言说明
5. **稳扎稳打** — 不要一口气做太多，确保每一步可验证、可回退
6. **文件引用** — 引用文件使用相对路径的 markdown 链接格式
7. **验证后再报成功** — 完成任何步骤后，必须实际验证结果再声称完成

---

## 项目信息

| 项目 | 内容 |
|------|------|
| 项目名称 | AI求职助手 |
| 项目类型 | 全栈 Web 应用（Next.js） |
| 运行方式 | 本地开发服务器（后续再部署） |
| 目标用途 | 简历加分项展示 + 面试 Demo |
| 用户 | 曹嘉明（大四应届生，AI产品经理方向） |

## 三大功能模块

| 模块 | 说明 | 对应加分项 |
|------|------|-----------|
| 📚 知识库问答 | 上传求职资料，用户自由提问 | ① AI Agent / 知识库问答 |
| ⚡ JD 分析工具 | 粘贴 JD → AI 提取结构化信息 | ② 自动化工具 |
| 🔗 简历匹配工作流 | JD分析 → 简历匹配 → 评分 → 建议 | ④ AI 工作流 |

## 技术约束

- 全栈代码构建（非 Dify 低代码）
- Next.js 14 App Router + TypeScript
- Tailwind CSS + shadcn/ui 组件库
- Supabase（PostgreSQL + Storage）
- DeepSeek API（AI 对话）
- 本地运行 `npm run dev`
