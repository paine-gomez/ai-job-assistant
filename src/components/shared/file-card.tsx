/**
 * FileCard — 已选/已上传文件的展示卡片
 *
 * 两种变体：
 * - "default": 大卡片（用于 JD 分析页上传后展示）
 * - "compact": 紧凑列表项（用于知识库文档列表）
 */
"use client";

import { Button } from "@/components/ui/button";
import { FileText, X, Trash2 } from "lucide-react";
import { formatFileSize, getFileExtension } from "@/lib/file-utils";
import { cn } from "@/lib/utils";

interface FileInfo {
  name: string;
  size: number | null;
  type?: string; // 可选的文件类型（用于 compact 模式显示标签）
}

interface FileCardProps {
  file: FileInfo;
  onRemove?: () => void;
  variant?: "default" | "compact";
  className?: string;
}

export function FileCard({ file, onRemove, variant = "default", className }: FileCardProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-zinc-900 p-2 group",
          className
        )}
      >
        <FileText className="h-4 w-4 text-zinc-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-300 truncate">{file.name}</p>
          <p className="text-xs text-zinc-600">
            {(file.type ?? getFileExtension(file.name))} · {formatFileSize(file.size)}
          </p>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400"
            onClick={onRemove}
            aria-label={`删除 ${file.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  }

  // default variant — 大卡片
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-4",
        className
      )}
    >
      <FileText className="h-8 w-8 text-indigo-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{file.name}</p>
        <p className="text-xs text-zinc-500">
          {formatFileSize(file.size)} · {getFileExtension(file.name)}
        </p>
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-red-400"
          onClick={onRemove}
          aria-label={`移除 ${file.name}`}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
