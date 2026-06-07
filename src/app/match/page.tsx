"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Target, Lightbulb, AlertTriangle, CheckCircle2, Upload, FileText, ArrowRight } from "lucide-react";
import { LoadingButton } from "@/components/shared/loading-button";
import { ResumeDialog } from "@/components/shared/resume-dialog";
import { useResume } from "@/hooks/use-resume";
import { ALL_EXTENSIONS } from "@/lib/file-utils";

interface MatchResult {
  totalScore: number;
  dimensions: { name: string; score: number; comment: string }[];
  strengths: string[];
  gaps: string[];
  resumeSuggestions: string[];
  interviewTips: string[];
}

function ReportSection({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof CheckCircle2;
  items: string[];
}) {
  return (
    <section className="border-t border-black/10 pt-6">
      <h3 className="flex items-center gap-2 text-sm font-medium text-black">
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="grid grid-cols-[32px_1fr] text-sm leading-6 text-zinc-700">
            <span className="text-zinc-400">{String(index + 1).padStart(2, "0")}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MatchPageContent() {
  const searchParams = useSearchParams();
  const { resume: savedResume, hasResume, isLoaded } = useResume();

  const [resumeText, setResumeText] = useState("");
  const passedJD = searchParams.get("jd");
  const [jdText, setJdText] = useState(() =>
    passedJD ? decodeURIComponent(passedJD) : ""
  );
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractingResume, setExtractingResume] = useState(false);
  const [extractingJD, setExtractingJD] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoaded && hasResume && !resumeText.trim() && !autoFilled) {
      queueMicrotask(() => {
        setResumeText(savedResume);
        setAutoFilled(true);
      });
    }
  }, [isLoaded, hasResume, savedResume, resumeText, autoFilled]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setText: (v: string | ((prev: string) => string)) => void,
    setExtracting: (v: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALL_EXTENSIONS.includes(ext)) {
      toast.error(`不支持 .${ext} 格式`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("文件大小不能超过 10MB");
      return;
    }

    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-text", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        setText((prev) => prev.trim() ? prev + "\n\n" + json.data.text : json.data.text);
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

  const handleMatch = async () => {
    if (!resumeText.trim()) { toast.error("请提供简历内容"); return; }
    if (!jdText.trim()) { toast.error("请提供 JD 内容"); return; }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jdText }),
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
        toast.success("匹配分析完成");
      } else {
        toast.error(json.error || "匹配失败");
      }
    } catch {
      toast.error("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const scoreTone = (score: number) => {
    if (score >= 80) return "bg-black";
    if (score >= 60) return "bg-zinc-500";
    return "bg-zinc-300";
  };

  return (
    <div className="editorial-shell px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-black/10 pb-6">
          <p className="editorial-label mb-3">AI Workflow</p>
          <h1 className="font-editorial text-5xl leading-none tracking-tight text-black md:text-7xl">
            Career Fit Report
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
            Match your resume against a target JD and generate a clear report: score, strengths, gaps and next actions.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <section className="editorial-card reveal-up rounded-[28px] p-5 md:p-7">
            <div className="mb-6 border-b border-black/10 pb-4">
              <p className="editorial-label">Sources</p>
              <h2 className="mt-2 text-xl font-medium text-black">输入材料</h2>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="resume-textarea" className="editorial-label">Resume Source</label>
                  <label className="flex cursor-pointer items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-xs text-zinc-600 transition-colors hover:border-black hover:text-black">
                    {extractingResume ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    {extractingResume ? "提取中..." : "上传文件"}
                    <input
                      ref={resumeFileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp,.bmp"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setResumeText, setExtractingResume)}
                      disabled={extractingResume}
                      aria-label="上传简历文件"
                    />
                  </label>
                </div>
                <Textarea
                  id="resume-textarea"
                  placeholder="Paste your resume here, or upload a file."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={9}
                  className="min-h-[260px] resize-none rounded-3xl border-black/10 bg-[#fafafa] p-5 text-sm leading-7 text-black placeholder:text-zinc-400 focus-visible:border-black focus-visible:ring-0"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="jd-textarea" className="editorial-label">JD Source</label>
                  <label className="flex cursor-pointer items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-xs text-zinc-600 transition-colors hover:border-black hover:text-black">
                    {extractingJD ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    {extractingJD ? "提取中..." : "上传文件"}
                    <input
                      ref={jdFileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp,.bmp"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setJdText, setExtractingJD)}
                      disabled={extractingJD}
                      aria-label="上传 JD 文件"
                    />
                  </label>
                </div>
                <Textarea
                  id="jd-textarea"
                  placeholder="Paste the target job description here."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={9}
                  className="min-h-[260px] resize-none rounded-3xl border-black/10 bg-[#fafafa] p-5 text-sm leading-7 text-black placeholder:text-zinc-400 focus-visible:border-black focus-visible:ring-0"
                />
              </div>

              {isLoaded && !hasResume && passedJD && (
                <div className="flex items-center justify-between rounded-3xl border border-black/10 bg-[#f7f7f4] p-4">
                  <p className="text-xs leading-5 text-zinc-500">
                    保存简历后，下次打开匹配页会自动填入。
                  </p>
                  <button
                    onClick={() => setResumeDialogOpen(true)}
                    className="ml-3 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-black"
                  >
                    <FileText className="h-3 w-3" /> 保存
                  </button>
                </div>
              )}

              <LoadingButton
                loading={loading}
                loadingText="AI 分析中..."
                icon={Target}
                onClick={handleMatch}
                disabled={!resumeText.trim() || !jdText.trim()}
                className="h-11 w-full rounded-full bg-black text-white hover:bg-zinc-800"
              >
                Generate Report
              </LoadingButton>
            </div>
          </section>

          <section className="editorial-card reveal-up reveal-delay-1 rounded-[28px] p-5 md:p-7">
            <div className="mb-6 border-b border-black/10 pb-4">
              <p className="editorial-label">Output</p>
              <h2 className="mt-2 text-xl font-medium text-black">匹配报告</h2>
            </div>

            {!result ? (
              <div className="flex min-h-[680px] flex-col justify-between rounded-3xl border border-dashed border-black/15 bg-[#fafafa] p-6">
                <p className="max-w-sm text-sm leading-7 text-zinc-500">
                  报告会在这里生成。它会把 AI 判断组织成面试官也容易理解的产品化结果：总分、维度、优势、差距和行动建议。
                </p>
                <p className="font-editorial text-7xl text-black/10">Fit / 100</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                  <div className="rounded-3xl bg-black p-6 text-white">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/50">Overall Score</p>
                    <p className="font-editorial mt-6 text-8xl leading-none">{result.totalScore}</p>
                    <p className="mt-2 text-sm text-white/60">/ 100</p>
                  </div>

                  <div className="space-y-5">
                    {result.dimensions.map((dimension) => (
                      <div key={dimension.name}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-black">{dimension.name}</span>
                          <span className="tabular-nums text-zinc-500">{dimension.score}分</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
                          <div
                            className={`h-full rounded-full ${scoreTone(dimension.score)}`}
                            style={{ width: `${dimension.score}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs leading-5 text-zinc-500">{dimension.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <ReportSection title="Strengths / 你的优势" icon={CheckCircle2} items={result.strengths} />
                <ReportSection title="Gaps / 需要提升" icon={AlertTriangle} items={result.gaps} />
                <ReportSection title="Resume Suggestions / 简历优化建议" icon={Lightbulb} items={result.resumeSuggestions} />
                <ReportSection title="Interview Prep / 面试准备建议" icon={Target} items={result.interviewTips} />

                <div className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-[#f7f7f4] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">下一步：生成面试题预测</p>
                    <p className="mt-1 text-xs text-zinc-500">基于这份 JD 和简历，预览面试官可能的提问方向。</p>
                  </div>
                  <Link
                    href={`/interview?jd=${encodeURIComponent(jdText)}`}
                    className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                  >
                    面试准备
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>

        <ResumeDialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen} />
      </div>
    </div>
  );
}

export default function MatchPage() {
  return (
    <Suspense fallback={null}>
      <MatchPageContent />
    </Suspense>
  );
}
