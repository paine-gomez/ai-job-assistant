"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";
import { useResume } from "@/hooks/use-resume";
import { ResumeDialog } from "@/components/shared/resume-dialog";

const links = [
  { href: "/", label: "首页" },
  { href: "/knowledge", label: "知识库问答" },
  { href: "/jd", label: "JD 分析" },
  { href: "/match", label: "简历匹配" },
];

export function Navbar() {
  const pathname = usePathname();
  const [resumeOpen, setResumeOpen] = useState(false);
  const { hasResume, isLoaded } = useResume();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="text-lg">🤖</span>
          <span className="hidden sm:inline">AI 求职助手</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-sm font-medium transition-colors",
                "text-zinc-400 hover:text-white hover:bg-white/5",
                pathname === link.href && "text-white bg-white/10"
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* 分隔 */}
          <span className="w-px h-5 bg-white/10 mx-1" aria-hidden="true" />

          {/* 简历存档按钮 */}
          <button
            onClick={() => setResumeOpen(true)}
            className="relative inline-flex items-center justify-center rounded-lg px-2 py-1 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="我的简历"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline ml-1.5">我的简历</span>
            {/* 已保存指示器 */}
            {isLoaded && hasResume && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-400" aria-hidden="true" />
            )}
          </button>
        </nav>
      </div>

      <ResumeDialog open={resumeOpen} onOpenChange={setResumeOpen} />
    </header>
  );
}
