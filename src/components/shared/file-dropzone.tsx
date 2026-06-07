/**
 * FileDropzone — 可复用的文件上传区
 *
 * 特性：
 * - 点击选择文件 + 键盘 Enter/Space 触发
 * - 拖拽高亮效果
 * - 内置格式和大小校验（校验失败时 toast 提示 + 重置 input）
 * - loading 状态显示 spinner
 * - 完全可访问：role="button" + tabIndex + aria-label + onKeyDown
 */
"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { validateFile } from "@/lib/file-utils";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  accept: string[];
  maxSize: number;
  onSelect: (file: File) => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  hint?: string;
  className?: string;
}

export function FileDropzone({
  accept,
  maxSize,
  onSelect,
  loading = false,
  disabled = false,
  label = "点击上传文件",
  hint,
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const result = validateFile(file, accept, maxSize);
      if (!result.valid) {
        toast.error(result.error || "文件无效");
        // 重置 input 以便重新选择同一文件
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      onSelect(file);
      if (inputRef.current) inputRef.current.value = "";
    },
    [accept, maxSize, onSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const acceptString = accept.map((ext) => `.${ext}`).join(",");

  return (
    <label
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      onKeyDown={disabled ? undefined : handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed p-10 text-center transition-colors",
        isDragOver
          ? "border-black bg-zinc-100"
          : "border-black/20 bg-white hover:border-black",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-10 w-10 text-black animate-spin" />
      ) : (
        <Upload className="h-10 w-10 text-zinc-400" />
      )}
      <div>
        <p className="text-sm font-medium text-black">
          {loading ? "处理中..." : label}
        </p>
        {hint && <p className="text-xs text-zinc-600 mt-1">{hint}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={acceptString}
        className="hidden"
        onChange={handleChange}
        disabled={disabled || loading}
        aria-hidden="true"
      />
    </label>
  );
}
