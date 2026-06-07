/**
 * ResumeDialog — 全局简历编辑弹窗
 *
 * 从 Navbar 触发。用户可在此粘贴/上传/编辑简历，保存后全局可用。
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useResume } from "@/hooks/use-resume";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { ALL_EXTENSIONS } from "@/lib/file-utils";

interface ResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResumeDialog({ open, onOpenChange }: ResumeDialogProps) {
  const { resume, hasResume, isLoaded, saveResume, clearResume } = useResume();
  const [text, setText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 弹窗打开时同步 localStorage 内容到本地编辑态
  useEffect(() => {
    if (open && isLoaded && !initialized) {
      queueMicrotask(() => {
        setText(resume);
        setInitialized(true);
      });
    }
    if (!open) {
      queueMicrotask(() => {
        setInitialized(false);
      });
    }
  }, [open, isLoaded, resume, initialized]);

  const handleSave = () => {
    saveResume(text);
    toast.success(text.trim() ? "简历已保存" : "简历已清除");
    onOpenChange(false);
  };

  const handleClear = () => {
    clearResume();
    setText("");
    toast.success("简历已清除");
    onOpenChange(false);
  };

  const handleCancel = () => {
    // 放弃未保存的修改
    onOpenChange(false);
  };

  const handleFileSelect = async (file: File) => {
    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-text", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        setText((prev) =>
          prev.trim() ? prev + "\n\n" + json.data.text : json.data.text
        );
        toast.success(`已提取: ${file.name}`);
      } else {
        toast.error(json.error || "提取失败");
      }
    } catch {
      toast.error("提取失败，请检查网络");
    } finally {
      setExtracting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden rounded-[28px] border-black/10 bg-white text-black"
        aria-describedby="resume-dialog-desc"
      >
        <DialogHeader>
          <DialogTitle>我的简历</DialogTitle>
          <DialogDescription id="resume-dialog-desc" className="text-zinc-500">
            保存后，打开匹配页时会自动填入，无需每次重复粘贴。
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-[2px]">
          <FileDropzone
            accept={ALL_EXTENSIONS}
            maxSize={10 * 1024 * 1024}
            onSelect={handleFileSelect}
            loading={extracting}
            label="上传简历文件提取文字"
            hint="支持 PDF、DOCX、TXT、PNG、JPG 等格式 · 最大 10MB"
            className="p-6"
          />

          <Textarea
            placeholder={"粘贴或编辑你的简历内容...\n\n示例：\n曹嘉明，XX大学计算机科学专业大四。\n技能：Python、SQL、Figma、PRD撰写。\n实习：XX科技AI产品实习生..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="resize-none rounded-3xl border-black/10 bg-[#fafafa] p-5 text-black placeholder:text-zinc-400 focus-visible:border-black focus-visible:ring-0"
            aria-label="简历内容"
          />
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={!hasResume}
            className="text-zinc-500 hover:text-black"
          >
            清除
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={handleSave} className="bg-black text-white hover:bg-zinc-800">
              保存
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
