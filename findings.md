# 发现记录 — AI求职助手

## 技术调研

### DeepSeek API
- **发现：** API 格式兼容 OpenAI SDK，可直接用 `openai` npm 包调用
- **Base URL：** `https://api.deepseek.com`
- **推荐模型：** `deepseek-chat`（性价比最高）
- **价格：** 输入 1元/百万tokens，输出 2元/百万tokens
- **文档：** https://platform.deepseek.com/api-docs
- **结论：** 适合本项目，便宜且中文能力强

### Supabase 免费版限制
- **数据库：** 500MB 存储，2个免费项目
- **Storage：** 1GB 文件存储，2GB 传输/月
- **向量扩展：** pgvector 需 Pro 版（$25/月），MVP 先用全文检索替代
- **暂停策略：** 1周不活跃会暂停，需在 Supabase 面板手动恢复
- **结论：** 免费版对本项目完全足够

### 文档解析方案
- **PDF：** `pdf-parse` 库，轻量但中文支持一般；备选 `pdfjs-dist`
- **DOCX：** `mammoth` 库，转为 HTML 再提取文本
- **TXT：** 直接读取，无需额外依赖
- **结论：** pdf-parse + mammoth 足够 MVP 使用

### shadcn/ui 使用方式
- **安装：** `npx shadcn-ui@latest init` 初始化
- **添加组件：** `npx shadcn-ui@latest add button` 按需添加
- **组件位置：** `src/components/ui/` 下
- **定制：** 直接修改组件源码，完全可控
- **结论：** 按需引入，避免安装不需要的组件

---

## 决策记录

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-06-07 | 不用 pgvector | 需要 Supabase Pro，MVP 用全文检索 + 长上下文替代 |
| 2026-06-07 | 不用认证系统 | 单用户场景，MVP 无需登录 |
| 2026-06-07 | 先不做移动端适配 | 桌面端是主要使用场景，移动端后续优化 |
| 2026-06-07 | AI 流式输出用 Server-Sent Events | Next.js 原生支持，实现简单 |

---

## 四角色审查记录 (2026-06-07)

### 架构师
- ✅ Node 24 需 Next.js 15（已修正 TECH_STACK.md）
- ✅ 对话历史 MVP 阶段只存前端内存（已确认，不持久化）
- ✅ 长文档分块策略：单文本块 ≤ 4000 字，检索取 Top-5 拼入上下文

### 工程师
- ✅ 依赖补全：lucide-react、sonner、react-markdown、@supabase/ssr、@ai-sdk/openai
- ✅ pdf-parse → pdfjs-dist（中文兼容性更好）
- ✅ 删除 lib/embeddings.ts，MVP 不做向量嵌入

### 审查者
- ✅ 信息来源标注 MVP 简化为 Prompt 控制，不做精确定位
- ✅ 评分展示改为横向进度条（shadcn/ui Progress），不做环形图
- ✅ 每步执行计划加入 git commit 节点

### 优化师
- ✅ 统一 API 响应格式：`{ success: boolean, data?: T, error?: string }`
- ✅ 文件大小限制从 10MB 降至 5MB（降低解析超时风险）
- ✅ AI SDK 明确用 @ai-sdk/openai 配置 DeepSeek

---

## 踩坑预警

1. **Prisma + Supabase 连接字符串** — Supabase 的连接字符串在 Project Settings → Database → Connection string，选 "Transaction" 模式 或 "Session" 模式（需手动加 `pgbouncer=true`）
2. **pdfjs-dist 在 Next.js 中的使用** — 需要配置 `experimental.serverComponentsExternalPackages: ['pdfjs-dist']`
3. **Node 24 兼容性** — Next.js 15 完全兼容，但某些老包可能有问题，遇错及时记录
4. **DeepSeek 并发限制** — 免费账号可能有并发限制，注意错误处理
5. **Supabase Storage 权限** — 默认 bucket 是 private，需在 Supabase Dashboard 设置为 public 或配置 RLS
