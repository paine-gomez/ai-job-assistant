/**
 * IntroCard — 自我介绍展示卡片
 *
 * 显示版本标签 + 文本内容 + 一键复制按钮。
 * 复制成功后按钮反馈 2 秒后恢复。
 */
"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface IntroCardProps {
  label: string;
  content: string;
  highlights?: string[];
}

export function IntroCard({ label, content, highlights }: IntroCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 降级：某些环境不支持 clipboard API
      toast.error("复制失败，请手动复制");
    }
  }, [content]);

  return (
    <div className="rounded-2xl border border-black/10 bg-white">
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-3">
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-400">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "已复制" : `复制${label}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1 text-xs text-zinc-600 transition-colors hover:border-black hover:text-black"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-600" />
              已复制
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              复制
            </>
          )}
        </button>
      </div>

      <div className="px-5 py-4">
        <p className="text-sm leading-7 text-zinc-700 whitespace-pre-wrap">
          {content}
        </p>

        {highlights && highlights.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-black/5 pt-4">
            {highlights.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/10 bg-[#f7f7f4] px-3 py-1 text-xs text-zinc-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
