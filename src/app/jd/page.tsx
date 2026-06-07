"use client";

import { useState } from "react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { FileCard } from "@/components/shared/file-card";
import { LoadingButton } from "@/components/shared/loading-button";
import { ALL_EXTENSIONS } from "@/lib/file-utils";

interface JDAnalysis {
  company: string;
  role: string;
  salary: string;
  education: string;
  experience: string;
  skills: string[];
  responsibilities: string[];
  keywords: string[];
  summary: string;
}

export default function JDPage() {
  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [result, setResult] = useState<JDAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (inputMode === "paste" && !jdText.trim()) {
      toast.error("请先粘贴 JD 内容");
      return;
    }
    if (inputMode === "upload" && !jdFile) {
      toast.error("请先上传 JD 文件");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      let res: Response;
      if (inputMode === "upload" && jdFile) {
        const formData = new FormData();
        formData.append("file", jdFile);
        res = await fetch("/api/jd/analyze", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/jd/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jdText }),
        });
      }
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
        toast.success("分析完成");
      } else {
        toast.error(json.error || "分析失败");
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
          title="JD Analysis"
          description="Turn long job descriptions into structured product-ready insights for role understanding and resume matching."
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="editorial-card reveal-up rounded-[28px] p-5 md:p-7">
            <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <p className="editorial-label">Source</p>
                <h2 className="mt-2 text-xl font-medium text-black">岗位原文</h2>
              </div>
              <div className="flex rounded-full border border-black/10 bg-[#f3f3f3] p-1" role="tablist" aria-label="输入方式">
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
                      inputMode === mode ? "bg-black text-white" : "text-zinc-500 hover:text-black"
                    }`}
                  >
                    {mode === "paste" ? "粘贴文本" : "上传文件"}
                  </button>
                ))}
              </div>
            </div>

            {inputMode === "paste" ? (
              <Textarea
                placeholder={"Paste a job description here...\n\n例如：AI 产品经理 / 岗位职责 / 任职要求 / 薪资范围"}
                value={jdText}
                onChange={(e) => {
                  setJdText(e.target.value);
                  setResult(null);
                }}
                rows={16}
                className="min-h-[390px] resize-none rounded-3xl border-black/10 bg-[#fafafa] p-5 text-sm leading-7 text-black placeholder:text-zinc-400 focus-visible:border-black focus-visible:ring-0"
                aria-label="JD 文本内容"
              />
            ) : (
              <div className="min-h-[390px]">
                {jdFile ? (
                  <FileCard
                    file={{ name: jdFile.name, size: jdFile.size }}
                    onRemove={() => setJdFile(null)}
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

            <LoadingButton
              loading={loading}
              loadingText="AI 分析中..."
              icon={undefined}
              onClick={handleAnalyze}
              disabled={(inputMode === "paste" && !jdText.trim()) || (inputMode === "upload" && !jdFile)}
              className="mt-5 h-11 w-full rounded-full bg-black text-white hover:bg-zinc-800"
            >
              Analyze JD
            </LoadingButton>
          </section>

          <section className="editorial-card reveal-up reveal-delay-1 rounded-[28px] p-5 md:p-7">
            <div className="mb-6 border-b border-black/10 pb-4">
              <p className="editorial-label">Analysis</p>
              <h2 className="mt-2 text-xl font-medium text-black">结构化岗位洞察</h2>
            </div>

            {!result ? (
              <div className="flex min-h-[470px] flex-col justify-between rounded-3xl border border-dashed border-black/15 bg-[#fafafa] p-6">
                <p className="max-w-sm text-sm leading-7 text-zinc-500">
                  分析完成后，这里会生成公司、岗位、薪资、技能、职责和总结。展示方式会像一份清晰的岗位分析稿，而不是普通工具输出。
                </p>
                <p className="font-editorial text-7xl text-black/10">Report</p>
              </div>
            ) : (
              <div className="space-y-7">
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  {[
                    ["Company", result.company],
                    ["Role", result.role],
                    ["Salary", result.salary],
                    ["Education", result.education],
                    ["Experience", result.experience],
                  ].map(([label, value]) => (
                    <div key={label} className={label === "Experience" ? "col-span-2" : ""}>
                      <p className="editorial-label">{label}</p>
                      <p className="mt-2 text-sm leading-6 text-black">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-black/10 pt-6">
                  <p className="editorial-label">Skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="rounded-full border-black/10 bg-white px-3 py-1 text-zinc-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t border-black/10 pt-6">
                  <p className="editorial-label">Responsibilities</p>
                  <ul className="mt-3 space-y-3">
                    {result.responsibilities.map((item, index) => (
                      <li key={`${item}-${index}`} className="grid grid-cols-[32px_1fr] text-sm leading-6 text-zinc-700">
                        <span className="text-zinc-400">{String(index + 1).padStart(2, "0")}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-black/10 pt-6">
                  <p className="editorial-label">Summary</p>
                  <p className="mt-3 text-lg leading-8 text-black">{result.summary}</p>
                </div>

                <div className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-[#f7f7f4] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">下一步：生成 Career Fit Report</p>
                    <p className="mt-1 text-xs text-zinc-500">把这份 JD 带入简历匹配工作流。</p>
                  </div>
                  <Link
                    href={`/match?jd=${encodeURIComponent(jdText || "")}`}
                    className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                  >
                    开始匹配 <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
