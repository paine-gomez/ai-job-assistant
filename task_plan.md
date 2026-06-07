# 任务规划 — AI求职助手

## 项目概述
为大四应届生曹嘉明（AI产品经理方向）构建全栈 AI 求职助手 Web 应用。

## 阶段划分

### 阶段 0: 文档搭建 ✅ 进行中
- [ ] CLAUDE.md 项目指引
- [ ] docs/REQUIREMENTS.md 需求规格
- [ ] docs/TECH_STACK.md 技术选型
- [ ] docs/DESIGN_SPEC.md 设计规范
- [ ] docs/EXECUTION_PLAN.md 执行计划
- [ ] task_plan.md / progress.md / findings.md
- [ ] dev-logs/2026-06-07.md

### 阶段 1: 项目脚手架
- [ ] 初始化 Next.js 项目
- [ ] 安装所有依赖
- [ ] 配置 Tailwind + shadcn/ui
- [ ] 创建 .env.local

### 阶段 2: 数据库
- [ ] Supabase 项目配置
- [ ] Prisma Schema 编写
- [ ] 创建数据库表

### 阶段 3: 核心服务层
- [ ] AI 客户端
- [ ] 文档解析服务
- [ ] Supabase 客户端
- [ ] 类型定义

### 阶段 4: API 端点
- [ ] 知识库 API（上传/问答/列表/删除）
- [ ] JD 分析 API
- [ ] 简历匹配 API

### 阶段 5: 前端页面
- [ ] Layout（导航+页脚）
- [ ] 首页
- [ ] 知识库问答页面
- [ ] 工具页

### 阶段 6: 收尾打磨
- [ ] 边界情况处理
- [ ] 错误提示完善
- [ ] 最终测试

---

## 决策记录
| 日期 | 决策项 | 结论 | 原因 |
|------|--------|------|------|
| 2026-06-07 | 技术路线 | 全栈代码（非 Dify） | 更灵活、简历加分更多 |
| 2026-06-07 | 部署策略 | 先本地运行 | 快速验证，后续再部署 |
| 2026-06-07 | AI 服务 | DeepSeek API | 便宜、中文好、国内可访问 |
| 2026-06-07 | 数据库 | Supabase (PostgreSQL) | 免费、自带存储 |
