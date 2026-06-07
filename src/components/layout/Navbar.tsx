"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "首页" },
  { href: "/knowledge", label: "知识库问答" },
  { href: "/tools", label: "求职工具" },
];

export function Navbar() {
  const pathname = usePathname();

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
        </nav>
      </div>
    </header>
  );
}
