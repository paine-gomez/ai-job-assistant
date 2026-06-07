# AI求职助手 — AI 助手指引

## 项目概述

为大四应届生曹嘉明（AI产品经理方向）构建 AI 求职助手 Web 应用。
全栈代码构建，三大功能模块：知识库问答、JD 分析、简历匹配。
**项目已完成，公网可访问。**

## 当前状态

| 项目 | 内容 |
|------|------|
| 项目名称 | AI求职助手 |
| 项目类型 | 全栈 Web 应用（Next.js 16 + React 19） |
| 状态 | ✅ 全部功能完成 |
| 本地运行 | `npm run dev` → `http://localhost:3000` |
| 公网访问 | ngrok 隧道（运行时临时链接） |
| Git | `933770f` — 两次 commit |
| 数据库 | SQLite（本地）+ Turso libsql（云端已备） |
| AI 服务 | DeepSeek API |

## 页面结构

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | Hero + 三张功能卡片 + 技术栈 |
| `/knowledge` | 知识库问答 | 文档上传 + 流式 AI 对话 |
| `/jd` | JD 分析 | 粘贴/上传 JD → AI 结构化分析 → 一键跳转匹配 |
| `/match` | 简历匹配 | 简历 + JD → 四维度评分 + 优化建议 |

## 架构概览

```
src/
├── app/
│   ├── page.tsx              # 首页
│   ├── layout.tsx             # 根布局（Navbar + Footer + Toaster）
│   ├── knowledge/page.tsx     # 知识库问答
│   ├── jd/page.tsx            # JD 分析
│   ├── match/page.tsx         # 简历匹配
│   └── api/
│       ├── knowledge/         # 知识库 CRUD + 流式问答
│       ├── jd/analyze/        # JD 分析（支持文件上传）
│       ├── match/             # 简历匹配评分
│       └── extract-text/      # 通用文本提取
├── components/
│   ├── layout/                # Navbar + Footer
│   ├── shared/                # 6 个共享组件
│   └── ui/                    # 8 个 shadcn/ui 组件
├── hooks/
│   └── use-resume.ts          # 全局简历存档（localStorage）
└── lib/
    ├── ai.ts                  # DeepSeek API 客户端 + parseAIJson
    ├── prisma.ts              # Prisma + libsql 客户端
    ├── document-parser.ts     # 统一文本提取（PDF/DOCX/TXT/OCR）
    ├── ocr.ts                 # Tesseract.js OCR
    ├── prompts.ts             # 集中管理 AI Prompt
    ├── api-response.ts        # 统一响应格式 {success, data, error}
    ├── file-utils.ts          # 文件校验 + 格式化
    └── utils.ts               # Tailwind className 合并
```

## 关键特性

- **全局简历存档：** Navbar「我的简历」按钮 → 保存到 localStorage → 匹配页自动填入
- **文件上传：** JD 分析和简历匹配支持 PDF/图片/DOCX/TXT 上传，图片自动 OCR
- **扫描版 PDF：** 自动检测空文字 PDF → 提取图片 → OCR 识别
- **流式 AI 回答：** SSE 逐字输出 + 跳动三点动画 + 闪烁光标
- **知识库多文档检索：** 搜索全部已上传文档，关键词匹配排序

## 共享组件

| 组件 | 用途 |
|------|------|
| `FileDropzone` | 文件上传区（拖拽+键盘+校验） |
| `FileCard` | 文件展示卡片（default/compact） |
| `PageHeader` | 页面标题 |
| `LoadingButton` | 带加载态的按钮 |
| `BouncingDots` | AI 思考动画 |
| `ResumeDialog` | 全局简历编辑弹窗 |

## 关键文件路径

| 用途 | 路径 |
|------|------|
| 📋 需求规格 | [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) |
| 🔧 技术选型 | [docs/TECH_STACK.md](docs/TECH_STACK.md) |
| 🎨 设计规范 | [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md) |
| 📝 执行计划 | [docs/EXECUTION_PLAN.md](docs/EXECUTION_PLAN.md) |
| 📅 开发日志 | [dev-logs/](dev-logs/) |
| 📈 进度追踪 | [progress.md](progress.md) |

## 工作原则（同人设）

1. **逐步执行** — 每完成一个步骤需用户确认后再继续
2. **先读规范再动手** — 每次操作前，阅读相关设计文档确认规范
3. **通俗解释** — 用户不懂代码，技术操作和结果需用通俗语言说明
4. **验证后再报成功** — 完成任何步骤后，必须实际验证结果再声称完成
5. **文件引用** — 引用文件使用相对路径的 markdown 链接格式
