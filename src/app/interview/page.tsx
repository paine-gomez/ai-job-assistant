"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, RefreshCw, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { FileCard } from "@/components/shared/file-card";
import { LoadingButton } from "@/components/shared/loading-button";
import { ResumeDialog } from "@/components/shared/resume-dialog";
import { ExpandableQuestionCard } from "@/components/shared/expandable-question-card";
import { useResume } from "@/hooks/use-resume";
import { ALL_EXTENSIONS } from "@/lib/file-utils";
import type { InterviewResult, InterviewQuestion } from "@/types";

const CATEGORY_META: {
  key: keyof InterviewResult["categories"];
  label: string;
  desc: string;
}[] = [
  { key: "resume", label: "简历深挖", desc: "针对简历中的具体项目与经历追问" },
  { key: "competency", label: "岗位胜任", desc: "验证 JD 要求的核心能力是否具备" },
  { key: "behavioral", label: "行为情景", desc: "实际工作场景中的应变与素养" },
];

function InterviewPageContent() {
  const searchParams = useSearchParams();
  const { resume: savedResume, hasResume, isLoaded } = useResume();

  const passedJD = searchParams.get("jd");
  const [resumeText, setResumeText] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);

  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");
  const [jdText, setJdText] = useState(() =>
    passedJD ? decodeURIComponent(passedJD) : ""
  );
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [result, setResult] = useState<InterviewResult | null>(null);
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
    if (inputMode === "paste" && !jdText.trim()) {
      toast.error("请先粘贴 JD 内容");
      return;
    }
    if (inputMode === "upload" && !jdFile) {
      toast.error("请先上传 JD 文件");
      return;
    }

    setLoading(true);
    try {
      let res: Response;
      if (inputMode === "upload" && jdFile) {
        // 上传模式：先提取文件文本
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
        res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: resumeText.trim(),
            jdText: extractJson.data.text,
          }),
        });
      } else {
        res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: resumeText.trim(),
            jdText: jdText.trim(),
          }),
        });
      }
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
        toast.success("面试题生成完成");
      } else {
        toast.error(json.error || "生成失败");
      }
    } catch {
      toast.error("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = result
    ? result.categories.resume.length +
      result.categories.competency.length +
      result.categories.behavioral.length
    : 0;

  return (
    <div className="editorial-shell px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Interview Prep"
          description="Generate personalized interview questions based on your resume and target JD. Predict what interviewers will actually ask."
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
                  <label htmlFor="interview-resume" className="editorial-label">
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
                    id="interview-resume"
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

              {/* JD 来源 */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="editorial-label">JD Source</label>
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
                    placeholder="Paste the target job description here..."
                    value={jdText}
                    onChange={(e) => {
                      setJdText(e.target.value);
                      setResult(null);
                    }}
                    rows={8}
                    className="min-h-[200px] resize-none rounded-3xl border-black/10 bg-[#fafafa] p-5 text-sm leading-7 text-black placeholder:text-zinc-400 focus-visible:border-black focus-visible:ring-0"
                    aria-label="JD 文本内容"
                  />
                ) : (
                  <div className="min-h-[200px]">
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
                        label="上传 JD 文件"
                        hint="PDF、DOCX、TXT、PNG、JPG · 最大 10MB"
                      />
                    )}
                  </div>
                )}
              </div>

              <LoadingButton
                loading={loading}
                loadingText="AI 生成面试题..."
                icon={RefreshCw}
                onClick={handleGenerate}
                disabled={
                  !resumeText.trim() ||
                  (inputMode === "paste" && !jdText.trim()) ||
                  (inputMode === "upload" && !jdFile)
                }
                className="h-11 w-full rounded-full bg-black text-white hover:bg-zinc-800"
              >
                生成面试题
              </LoadingButton>
            </div>
          </section>

          {/* ── 右栏：面试题输出 ── */}
          <section className="editorial-card reveal-up reveal-delay-1 rounded-[28px] p-5 md:p-7">
            <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <p className="editorial-label">Output</p>
                <h2 className="mt-2 text-xl font-medium text-black">
                  面试题预测
                </h2>
              </div>
              {result && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:border-black hover:text-black disabled:opacity-50"
                  aria-label="重新生成面试题"
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
                    填入简历和目标 JD 后生成个性化面试题。题目会按三个维度分类：
                    简历深挖、岗位胜任、行为情景。每道题可展开查看考察意图和回答思路。
                  </p>
                  {!hasResume && isLoaded && (
                    <p className="max-w-sm text-xs leading-5 text-zinc-400">
                      提示：请先在左栏保存简历内容。
                    </p>
                  )}
                </div>
                <p className="font-editorial text-7xl text-black/10">
                  Interview / Prep
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {result.role && (
                  <div className="rounded-2xl border border-black/10 bg-[#f7f7f4] px-5 py-3">
                    <span className="editorial-label">目标岗位</span>
                    <span className="ml-3 text-sm font-medium text-black">
                      {result.role}
                    </span>
                    <span className="ml-3 text-xs text-zinc-400">
                      {totalQuestions} 道面试题
                    </span>
                  </div>
                )}

                {CATEGORY_META.map(({ key, label, desc }) => {
                  const questions = result.categories[key];
                  if (!questions || questions.length === 0) return null;

                  return (
                    <section key={key}>
                      <div className="mb-4">
                        <p className="editorial-label">{label}</p>
                        <p className="mt-1 text-xs text-zinc-400">{desc}</p>
                      </div>
                      <div className="space-y-2">
                        {questions.map((q: InterviewQuestion, i: number) => (
                          <ExpandableQuestionCard
                            key={q.id}
                            question={q}
                            index={i + 1}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
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

export default function InterviewPage() {
  return (
    <Suspense fallback={null}>
      <InterviewPageContent />
    </Suspense>
  );
}
