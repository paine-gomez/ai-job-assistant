/**
 * useResume — 全局简历状态管理
 *
 * 将简历文本持久化到 localStorage，实现"一次填写，处处可用"。
 *
 * SSR 安全：所有 localStorage 调用包裹在 try/catch 中，
 * 无痕模式/隐私窗口下功能自动降级（不报错）。
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "my-resume";
const MAX_SIZE = 100 * 1024; // 100KB 警告阈值

interface StoredResume {
  text: string;
  updatedAt: number;
}

function readResume(): StoredResume | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.text === "string" && parsed.text.trim().length > 0) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeResume(text: string): void {
  const data: StoredResume = { text: text.trim(), updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function removeResume(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function useResume() {
  const [resume, setResume] = useState("");
  const [hasResume, setHasResume] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 首次挂载时从 localStorage 恢复
  useEffect(() => {
    try {
      const stored = readResume();
      if (stored) {
        setResume(stored.text);
        setHasResume(true);
      }
    } catch {
      // localStorage 不可用（SSR/隐私模式），静默降级
    }
    setIsLoaded(true);
  }, []);

  const saveResume = useCallback((text: string) => {
    const trimmed = text.trim();
    try {
      if (trimmed) {
        // 超长文本仅警告，不阻止
        if (trimmed.length > MAX_SIZE) {
          toast.warning(`简历文本较长（${Math.round(trimmed.length / 1024)}KB），仍已保存`);
        }
        writeResume(trimmed);
        setResume(trimmed);
        setHasResume(true);
      } else {
        // 空文本等同于清除
        removeResume();
        setResume("");
        setHasResume(false);
      }
    } catch (e) {
      // QuotaExceededError
      if (e instanceof DOMException && e.name === "QuotaExceededError") {
        toast.error("存储空间不足，请精简简历内容后重试");
      } else {
        toast.error("保存失败，请重试");
      }
    }
  }, []);

  const clearResume = useCallback(() => {
    try {
      removeResume();
    } catch {
      // 忽略
    }
    setResume("");
    setHasResume(false);
  }, []);

  return { resume, hasResume, isLoaded, saveResume, clearResume };
}
