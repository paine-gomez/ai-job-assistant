# 技术选型文档

## 选型总览

| 层 | 技术 | 版本 | 理由 |
|----|------|------|------|
| 框架 | Next.js | 15 (App Router) | React 全栈框架，前后端一体，兼容 Node 24 |
| 语言 | TypeScript | 5.x | 类型安全，减少低级错误 |
| 样式 | Tailwind CSS | 4.x | 原子化 CSS，开发快 |
| 组件库 | shadcn/ui | latest | 高质量、可定制、复制即用 |
| 数据库 | Supabase | - | 免费 PostgreSQL + 存储 + 自带 API |
| ORM | Prisma | 6.x | 类型安全的数据库操作，和 TypeScript 配合好 |
| AI | DeepSeek API | - | 国产大模型，便宜好用，中文能力强 |
| AI SDK | @ai-sdk/openai | latest | Vercel AI SDK，统一 LLM 调用接口 |
| 文档解析 | pdfjs-dist + mammoth | latest | 分别解析 PDF 和 DOCX，pdfjs 对中文更友好 |
| Toast | sonner | latest | 轻量 Toast 通知 |
| 图标 | lucide-react | latest | 开源图标库，shadcn/ui 默认配套 |

---

## 为什么不选其他方案

### 为什么不用 Dify？
- Dify 是低代码平台，灵活性差
- 界面模板化，无法展示设计能力
- 受平台限制，不能完全自定义
- 全栈代码项目在简历上分量更重

### 为什么不用 Python 后端（如 FastAPI）？
- 维护两套代码（前端+后端）增加复杂度
- Next.js API Routes 已足够处理当前需求
- 部署简单（一个服务搞定前后端）

### 为什么不用 MySQL / SQLite？
- Supabase 提供免费 PostgreSQL，无需自己搭建
- 自带文件存储，不需要额外配置
- 后续可升级 pgvector 做向量检索
- SQLite 不支持并发，不适合后续扩展

### 为什么不用 OpenAI / Claude API？
- DeepSeek 中文能力强，价格便宜（约 1/10）
- 国内访问无需代理
- API 格式兼容 OpenAI SDK，用 `@ai-sdk/openai` 配置即可

### 为什么用 @ai-sdk/openai 而不是直接 openai 包？
- Vercel AI SDK 提供统一接口，后续切模型零成本
- 内置流式响应处理（`streamText`）
- 与 Next.js App Router 原生配合

---

## 依赖清单

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@prisma/client": "^6.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.5.0",
    "pdfjs-dist": "^4.0.0",
    "mammoth": "^1.8.0",
    "@ai-sdk/openai": "^1.0.0",
    "ai": "^4.0.0",
    "sonner": "^1.0.0",
    "lucide-react": "^0.400.0",
    "react-markdown": "^9.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "prisma": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

---

## 项目运行方式

```bash
# 安装依赖
npm install

# 配置环境变量（复制 .env.local.example 为 .env.local，填入 API Key）

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev
# 浏览器打开 http://localhost:3000
```
