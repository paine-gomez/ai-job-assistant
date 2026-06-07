"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";
import { useResume } from "@/hooks/use-resume";
import { ResumeDialog } from "@/components/shared/resume-dialog";

const links = [
  { href: "/", label: "Home" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/jd", label: "JD" },
  { href: "/match", label: "Match" },
  { href: "/interview", label: "Interview" },
  { href: "/intro", label: "Intro" },
];

export function Navbar() {
  const pathname = usePathname();
  const [resumeOpen, setResumeOpen] = useState(false);
  const { hasResume, isLoaded } = useResume();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white/78 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-baseline gap-2 text-sm font-semibold tracking-tight text-black">
          <span>曹嘉明</span>
          <span className="hidden text-xs font-normal uppercase tracking-[0.2em] text-zinc-400 sm:inline">
            AI Job Assistant
          </span>
        </Link>

        <nav className="flex items-center gap-1.5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "editorial-link inline-flex items-center justify-center px-1.5 py-1 text-xs font-medium uppercase tracking-[0.14em]",
                pathname === link.href ? "text-black" : "text-zinc-500 hover:text-black"
              )}
            >
              {link.label}
            </Link>
          ))}

          <span className="mx-1 h-4 w-px bg-black/10" aria-hidden="true" />

          <button
            onClick={() => setResumeOpen(true)}
            className="relative inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-black hover:text-black"
            aria-label="我的简历"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline ml-1.5">我的简历</span>
            {isLoaded && hasResume && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-black" aria-hidden="true" />
            )}
          </button>
        </nav>
      </div>

      <ResumeDialog open={resumeOpen} onOpenChange={setResumeOpen} />
    </header>
  );
}
