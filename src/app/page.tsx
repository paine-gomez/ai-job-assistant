import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const modules = [
  {
    number: "01",
    title: "Knowledge Base",
    desc: "上传简历、报告和求职资料，围绕材料进行可追溯问答。",
    href: "/knowledge",
  },
  {
    number: "02",
    title: "JD Analysis",
    desc: "把冗长招聘描述提炼成岗位、技能、薪资和职责结构。",
    href: "/jd",
  },
  {
    number: "03",
    title: "Resume Match",
    desc: "从四个维度生成匹配评分、差距分析和下一步行动建议。",
    href: "/match",
  },
  {
    number: "04",
    title: "Interview Prep",
    desc: "根据岗位 JD 和简历，生成个性化面试题预测与回答思路。",
    href: "/interview",
  },
  {
    number: "05",
    title: "Self Intro",
    desc: "生成针对岗位定制的自我介绍，含 30 秒简洁版与 2 分钟详细版。",
    href: "/intro",
  },
];

const stack = ["Next.js", "TypeScript", "Prisma", "DeepSeek", "OCR", "Streaming"];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-[#f7f7f4]">
      <section className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-8 md:py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="slow-drift absolute left-[6vw] top-[8vh] w-52 rotate-[-9deg] rounded-[28px] border border-black/10 bg-white/70 p-5 opacity-70 blur-[1px]">
            <p className="editorial-label">Resume Signal</p>
            <div className="mt-5 space-y-2">
              <span className="block h-2 w-32 rounded-full bg-black/20" />
              <span className="block h-2 w-44 rounded-full bg-black/10" />
              <span className="block h-2 w-24 rounded-full bg-black/10" />
            </div>
          </div>
          <div className="slow-drift absolute right-[7vw] top-[14vh] w-64 rotate-[8deg] rounded-[32px] border border-black/10 bg-black p-6 text-white opacity-[0.08] blur-[2px]">
            <p className="text-5xl font-semibold">82</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em]">Career Fit</p>
          </div>
          <div className="absolute bottom-[14vh] left-[12vw] h-44 w-72 rotate-[5deg] rounded-[32px] bg-[linear-gradient(135deg,#111,#aaa,#fff)] opacity-20 blur-md" />
          <div className="absolute bottom-[10vh] right-[16vw] w-72 rotate-[-7deg] rounded-[28px] border border-black/10 bg-white/60 p-5 opacity-75 blur-[1px]">
            <p className="editorial-label">JD Keywords</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["AI", "Product", "Data", "Workflow"].map((item) => (
                <span key={item} className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/50">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="editorial-card reveal-up relative z-10 flex h-[72vh] min-h-[540px] w-full max-w-[1180px] flex-col rounded-[28px] px-5 py-5 md:h-[68vh] md:px-8 md:py-7">
          <div className="grid grid-cols-2 gap-4 text-xs text-zinc-500 md:grid-cols-3">
            <p className="font-semibold text-black">曹嘉明</p>
            <p className="hidden text-center uppercase tracking-[0.18em] md:block">
              AI Product Manager / Job Assistant
            </p>
            <nav className="flex justify-end gap-4 uppercase tracking-[0.14em]">
              <Link className="editorial-link" href="/knowledge">Knowledge</Link>
              <Link className="editorial-link" href="/jd">JD</Link>
              <Link className="editorial-link" href="/match">Match</Link>
            </nav>
          </div>

          <div className="grid flex-1 grid-cols-1 items-center md:grid-cols-[160px_1fr_160px]">
            <div className="hidden text-xs leading-5 text-zinc-500 md:block">
              <p className="editorial-label">Portfolio / 2026</p>
              <p className="mt-4">AI-powered job search demo for interviews and product thinking.</p>
            </div>

            <div className="text-center">
              <h1 className="font-editorial text-[17vw] leading-[0.78] tracking-tight text-[#111] md:text-[11vw]">
                曹嘉明
                <span className="block text-[15vw] md:text-[9vw]">AI Job Assistant</span>
              </h1>
            </div>

            <div className="hidden justify-self-end text-right text-xs leading-5 text-zinc-500 md:block">
              <p className="editorial-label">Live Modules</p>
              <p className="mt-4">RAG / JD Parsing / Career Fit Report</p>
            </div>
          </div>

          <div className="grid gap-2 border-t border-black/10 pt-4 md:grid-cols-3">
            {modules.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex items-center justify-between rounded-2xl px-3 py-3 transition-colors hover:bg-[#f3f3f3]"
              >
                <span>
                  <span className="mr-3 text-xs text-zinc-400">{item.number}</span>
                  <span className="text-sm font-medium text-black">{item.title}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[0.75fr_1.25fr]">
        <div className="reveal-up">
          <p className="editorial-label">What it does</p>
          <h2 className="font-editorial mt-4 text-5xl leading-none text-black md:text-7xl">
            A refined AI workflow for job preparation.
          </h2>
        </div>
        <div className="reveal-up reveal-delay-1 space-y-8">
          <p className="max-w-2xl text-xl leading-9 text-zinc-700">
            这不是一个普通工具箱，而是一条面向应届生求职场景的 AI 产品路径：从资料理解，到岗位分析，再到简历匹配和行动建议。
          </p>
          <div className="grid gap-3">
            {modules.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group grid gap-4 border-t border-black/10 py-5 transition-colors hover:bg-[#f3f3f3] md:grid-cols-[80px_1fr_24px]"
              >
                <span className="text-xs text-zinc-400">{item.number}</span>
                <span>
                  <span className="block text-lg font-medium text-black">{item.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-zinc-500">{item.desc}</span>
                </span>
                <ArrowUpRight className="h-5 w-5 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-4">
          <div className="md:col-span-1">
            <p className="editorial-label">Stack</p>
          </div>
          <div className="flex flex-wrap gap-2 md:col-span-3">
            {stack.map((item) => (
              <span key={item} className="rounded-full border border-black/10 px-4 py-2 text-sm text-zinc-700">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
