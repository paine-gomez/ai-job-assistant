"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Upload, RefreshCw, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { FileCard } from "@/components/shared/file-card";
import { LoadingButton } from "@/components/shared/loading-button";
import { ResumeDialog } from "@/components/shared/resume-dialog";
import { IntroCard } from "@/components/shared/intro-card";
import { useResume } from "@/hooks/use-resume";
import { ALL_EXTENSIONS } from "@/lib/file-utils";
import type { IntroResult } from "@/types";

export default function IntroPage() {
  const { resume: savedResume, hasResume, isLoaded } = useResume();

  const [resumeText, setResumeText] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);

  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [result, setResult] = useState<IntroResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);

  // 自动填入简历
  useEffect(() => {
    if (isLoaded && hasResume && !resumeText.trim() && !autoFilled) {
      queueMicrotask(() => {
        setResumeText(savedResume);
        setAutoFilled(true);
      });
    }
  }, [isLoaded, hasResume, savedResume, resumeText, autoFilled]);

  const handleGenerate = async () => {
    if (!resumeText.trim()) {
      toast.error("请先保存或输入简历内容");
      return;
    }

    setLoading(true);
    try {
      let jdForApi = "";
      if (inputMode === "upload" && jdFile) {
        const formData = new FormData();
        formData.append("file", jdFile);
        const extractRes = await fetch("/api/extract-text", {
          method: "POST",
          body: formData,
        });
        const extractJson = await extractRes.json();
        if (!extractJson.success) {
          toast.error(extractJson.error || "文件解析失败");
          return;
        }
        jdForApi = extractJson.data.text;
      } else if (inputMode === "paste" && jdText.trim()) {
        jdForApi = jdText.trim();
      }

      const res = await fetch("/api/intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jdText: jdForApi || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
        toast.success("自我介绍生成完成");
      } else {
        toast.error(json.error || "生成失败");
      }
    } catch {
      toast.error("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editorial-shell px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Self Intro"
          description="Generate a tailored self-introduction for interviews. Two versions included: a 30-second elevator pitch and a 2-minute formal introduction."
        />

        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          {/* ── 左栏：输入源 ── */}
          <section className="editorial-card reveal-up rounded-[28px] p-5 md:p-7">
            <div className="mb-6 border-b border-black/10 pb-4">
              <p className="editorial-label">Sources</p>
              <h2 className="mt-2 text-xl font-medium text-black">输入材料</h2>
            </div>

            <div className="space-y-5">
              {/* 简历来源 */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="intro-resume" className="editorial-label">
                    Resume Source
                  </label>
                  <button
                    type="button"
                    onClick={() => setResumeDialogOpen(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-xs text-zinc-600 transition-colors hover:border-black hover:text-black"
                  >
                    <FileText className="h-3 w-3" />
                    {hasResume ? "编辑简历" : "保存简历"}
                  </button>
                </div>
                {!isLoaded ? (
                  <div className="flex min-h-[120px] items-center justify-center rounded-3xl bg-[#fafafa]">
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-300" />
                  </div>
                ) : hasResume ? (
                  <Textarea
                    id="intro-resume"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={5}
                    className="min-h-[120px] resize-none rounded-3xl border-black/10 bg-[#fafafa] p-5 text-sm leading-7 text-black placeholder:text-zinc-400 focus-visible:border-black focus-visible:ring-0"
                    aria-label="简历内容"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-black/15 bg-[#fafafa] px-4 py-10 text-center">
                    <p className="text-sm text-zinc-500">
                      尚未保存简历，请点击右上角「保存简历」按钮添加
                    </p>
                  </div>
                )}
              </div>

              {/* JD 来源（可选） */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="editorial-label">
                    JD Source{" "}
                    <span className="text-zinc-400">· 可选</span>
                  </label>
                  <div
                    className="flex rounded-full border border-black/10 bg-[#f3f3f3] p-1"
                    role="tablist"
                    aria-label="JD 输入方式"
                  >
                    {(["paste", "upload"] as const).map((mode) => (
                      <button
                        key={mode}
                        role="tab"
                        aria-selected={inputMode === mode}
                        onClick={() => {
                          setInputMode(mode);
                          setResult(null);
                        }}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          inputMode === mode
                            ? "bg-black text-white"
                            : "text-zinc-500 hover:text-black"
                        }`}
                      >
                        {mode === "paste" ? "粘贴文本" : "上传文件"}
                      </button>
                    ))}
                  </div>
                </div>
                {inputMode === "paste" ? (
                  <Textarea
                    placeholder="Paste the target job description here (optional)..."
                    value={jdText}
                    onChange={(e) => {
                      setJdText(e.target.value);
                      setResult(null);
                    }}
                    rows={6}
                    className="min-h-[140px] resize-none rounded-3xl border-black/10 bg-[#fafafa] p-5 text-sm leading-7 text-black placeholder:text-zinc-400 focus-visible:border-black focus-visible:ring-0"
                    aria-label="JD 文本内容（可选）"
                  />
                ) : (
                  <div className="min-h-[140px]">
                    {jdFile ? (
                      <FileCard
                        file={{ name: jdFile.name, size: jdFile.size }}
                        onRemove={() => {
                          setJdFile(null);
                          setResult(null);
                        }}
                      />
                    ) : (
                      <FileDropzone
                        accept={ALL_EXTENSIONS}
                        maxSize={10 * 1024 * 1024}
                        onSelect={(file) => {
                          setJdFile(file);
                          setResult(null);
                        }}
                        label="上传 JD 文件（可选）"
                        hint="PDF、DOCX、TXT、PNG、JPG · 最大 10MB"
                      />
                    )}
                  </div>
                )}
              </div>

              <LoadingButton
                loading={loading}
                loadingText="AI 生成中..."
                icon={RefreshCw}
                onClick={handleGenerate}
                disabled={!resumeText.trim()}
                className="h-11 w-full rounded-full bg-black text-white hover:bg-zinc-800"
              >
                生成自我介绍
              </LoadingButton>
            </div>
          </section>

          {/* ── 右栏：自我介绍输出 ── */}
          <section className="editorial-card reveal-up reveal-delay-1 rounded-[28px] p-5 md:p-7">
            <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <p className="editorial-label">Output</p>
                <h2 className="mt-2 text-xl font-medium text-black">
                  自我介绍
                </h2>
              </div>
              {result && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:border-black hover:text-black disabled:opacity-50"
                  aria-label="重新生成自我介绍"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
                  />
                  重新生成
                </button>
              )}
            </div>

            {!result ? (
              <div className="flex min-h-[520px] flex-col justify-between rounded-3xl border border-dashed border-black/15 bg-[#fafafa] p-6">
                <div className="space-y-3">
                  <p className="max-w-sm text-sm leading-7 text-zinc-500">
                    填入简历后点击生成。可选择性添加目标 JD 让自我介绍更具针对性。
                    生成后你将得到两个版本：30 秒简洁版和 2 分钟详细版。
                  </p>
                  {!hasResume && isLoaded && (
                    <p className="max-w-sm text-xs leading-5 text-zinc-400">
                      提示：请先在左栏保存简历内容。
                    </p>
                  )}
                </div>
                <p className="font-editorial text-7xl text-black/10">
                  Self / Intro
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {result.role && (
                  <div className="rounded-2xl border border-black/10 bg-[#f7f7f4] px-5 py-3">
                    <span className="editorial-label">目标岗位</span>
                    <span className="ml-3 text-sm font-medium text-black">
                      {result.role}
                    </span>
                  </div>
                )}

                <IntroCard
                  label="30秒简洁版"
                  content={result.shortVersion}
                  highlights={result.highlights}
                />
                <IntroCard
                  label="2分钟详细版"
                  content={result.longVersion}
                />
              </div>
            )}
          </section>
        </div>

        <ResumeDialog
          open={resumeDialogOpen}
          onOpenChange={setResumeDialogOpen}
        />
      </div>
    </div>
  );
}
