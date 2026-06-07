import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Zap, Link2 } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "知识库问答",
    desc: "上传求职资料（简历、行业报告等），让 AI 基于资料回答你的问题。面试前快速回顾，准备更充分。",
    href: "/knowledge",
    tags: ["RAG", "AI Agent"],
  },
  {
    icon: Zap,
    title: "JD 分析工具",
    desc: "粘贴招聘 JD，AI 一键提取公司、岗位、薪资、技能要求等结构化信息。省去逐字阅读的麻烦。",
    href: "/tools",
    tags: ["自动化工具", "信息提取"],
  },
  {
    icon: Link2,
    title: "简历匹配工作流",
    desc: "上传简历 + 目标 JD，AI 从四个维度评分，指出优势与差距，给出优化和面试建议。",
    href: "/tools",
    tags: ["AI 工作流", "匹配引擎"],
  },
];

const techStack = [
  "Next.js 16", "TypeScript", "Tailwind CSS", "shadcn/ui",
  "Prisma", "DeepSeek AI", "RAG", "SSE Streaming",
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center px-4 py-16 md:py-24">
      {/* Hero */}
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          AI 求职助手
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          为应届生打造的智能求职工具箱，用 AI 提升求职效率
        </p>
      </div>

      {/* Feature Cards */}
      <div className="mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card
            key={f.title}
            className="group flex flex-col border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-indigo-500/50 hover:-translate-y-1"
          >
            <f.icon className="h-8 w-8 text-indigo-400" />
            <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
            <p className="mt-2 flex-1 text-sm text-zinc-400">{f.desc}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {f.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
            <Link
              href={f.href}
              className="inline-flex h-7 items-center justify-center rounded-lg border border-zinc-700 bg-transparent px-2.5 text-[0.8rem] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors mt-4 w-full"
            >
              开始使用 →
            </Link>
          </Card>
        ))}
      </div>

      {/* Tech Stack */}
      <div className="mt-16 max-w-2xl text-center">
        <p className="text-sm text-zinc-500">技术栈</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {techStack.map((t) => (
            <Badge key={t} variant="outline" className="border-zinc-700 text-zinc-400">
              {t}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
