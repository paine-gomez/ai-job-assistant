# 设计规范文档

## UI 线路

当前 UI 线路为 **Editorial Product 风**。

目标不是做普通后台工具，而是把 AI 求职助手包装成一个可展示、可操作、可讲述的 **AI 产品经理作品集式 Demo**。

设计原则：

- 首页负责“让面试官记住曹嘉明和项目”
- 功能页负责“证明产品真的能解决求职问题”
- 视觉参考 Ingmar Coenen Portfolio 的 light minimal、瑞士排版、白色大卡片、编辑式留白和克制动效
- 不照抄参考站，只提取视觉气质并转译到 AI 求职助手场景

---

## 设计理念

**高级、极简、编辑感、产品秩序。**

首页偏作品集封面，使用背景信息拼贴和巨型 serif 标题建立记忆点；功能页偏高级产品工具，使用双栏、细线、白底报告、克制按钮和清晰结果区保证可用性。

---

## 配色方案

| 用途 | 色值 | 说明 |
|------|------|------|
| 主背景 | `#FFFFFF` / `#F7F7F4` | 白色和暖浅灰，形成轻盈纸张感 |
| 主文字 | `#000000` / `#171717` | 高对比黑色，用于标题和核心信息 |
| 次级文字 | `#9C9C9C` | 导航、副标题、说明文字 |
| 分割线 | `#E6E6E6` | 细线分隔，建立瑞士排版秩序 |
| 面板背景 | `#FFFFFF` | 主卡片、报告、功能面板 |
| 输入背景 | `#FAFAFA` | 编辑器、文本框、结果占位区 |
| Hover 背景 | `#F3F3F3` | 列表行、入口、轻交互反馈 |
| 主按钮 | `#000000` | 关键操作按钮 |

原则：不使用大面积彩色渐变，不使用厚重阴影，不使用深色后台风。

---

## 字体

| 用途 | 字体 | 说明 |
|------|------|------|
| 正文 / 导航 | 系统无衬线 | `-apple-system`, `PingFang SC`, `Microsoft YaHei`, `Segoe UI` |
| 首页巨型标题 | Georgia | 模拟 Editorial / Tiempos Headline 气质 |
| 标签 / 小字 | 系统无衬线 + 大写字距 | 建立 Swiss editorial 信息层级 |
| 代码 / 技术标签 | JetBrains Mono / Consolas | 用于技术栈和少量标签 |

---

## 页面结构

### 1. 首页 `/`

定位：作品集式封面。

结构：

```text
背景信息拼贴层
├─ 简历片段卡片
├─ JD keywords 卡片
├─ Career Fit 大数字
└─ 抽象渐变材质块

中央白色大卡片
├─ 顶部三段式导航
│  ├─ 曹嘉明
│  ├─ AI Product Manager / Job Assistant
│  └─ Knowledge / JD / Match
├─ 巨型 serif 标题
│  ├─ 曹嘉明
│  └─ AI Job Assistant
├─ Portfolio / 2026 辅助信息
└─ 三个模块入口
```

首页下方补充项目说明、模块列表和技术栈，便于面试官理解项目价值。

### 2. 知识库问答页 `/knowledge`

定位：Research Notes + Document Archive。

结构：

```text
页面标题：Knowledge Base

左侧 Document Archive
├─ 上传资料
├─ 文件列表
└─ 文件数量

右侧 AI Conversation
├─ 基于资料的问答记录
├─ AI 文本块
├─ 用户问题块
└─ 底部圆角输入栏
```

原则：弱化聊天软件气泡感，更像资料研究台。

### 3. JD 分析页 `/jd`

定位：岗位信息分析稿。

结构：

```text
页面标题：JD Analysis

左侧 Source
├─ 粘贴文本 / 上传文件
├─ JD 原文编辑区
└─ Analyze JD

右侧 Analysis
├─ Company
├─ Role
├─ Salary
├─ Education
├─ Experience
├─ Skills
├─ Responsibilities
├─ Summary
└─ 下一步：进入简历匹配
```

原则：结果像一份可阅读的岗位分析报告，而不是表单返回。

### 4. 简历匹配页 `/match`

定位：Career Fit Report。

结构：

```text
页面标题：Career Fit Report

左侧 Sources
├─ Resume Source
├─ JD Source
└─ Generate Report

右侧 Output
├─ Overall Score 大数字
├─ 四维度评分细线进度
├─ Strengths
├─ Gaps
├─ Resume Suggestions
└─ Interview Prep
```

原则：让 AI 输出像一份可信的求职决策报告。

---

## 组件规则

- 大面板使用 `28px` 圆角、白底、细边框、轻阴影
- 输入框使用浅灰底、细边框、较大内边距，像编辑器
- 标签使用黑白灰 pill，不使用强彩色
- 关键按钮使用黑底白字、圆角胶囊
- 普通链接使用文字下划线 hover
- 列表 hover 使用 `#F3F3F3` 背景和轻微位移

---

## 动效规则

- 页面进入：opacity 0 → 1，y 28 → 0
- 首页背景拼贴：慢速轻微漂移和缩放
- 模块入口 hover：箭头轻微位移
- 结果区 reveal：分区逐块出现
- 禁止弹跳、夸张缩放和过度炫技

动效以 CSS 为主，后续如需要更完整的 smooth scroll 和 timeline，可再引入 GSAP / Lenis。
