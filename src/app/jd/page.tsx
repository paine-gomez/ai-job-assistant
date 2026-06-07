"use client";

import { useState } from "react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader
        title="JD 分析"
        description="粘贴或上传招聘 JD，AI 自动提取结构化信息"
      />

      {/* 输入方式切换 */}
      <div className="flex gap-1 p-1 rounded-lg bg-zinc-900 w-fit mb-4" role="tablist" aria-label="输入方式">
        <button
          role="tab"
          aria-selected={inputMode === "paste"}
          onClick={() => { setInputMode("paste"); setResult(null); }}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            inputMode === "paste" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          粘贴文本
        </button>
        <button
          role="tab"
          aria-selected={inputMode === "upload"}
          onClick={() => { setInputMode("upload"); setResult(null); }}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            inputMode === "upload" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          上传文件
        </button>
      </div>

      {/* 粘贴模式 */}
      {inputMode === "paste" && (
        <Textarea
          placeholder={"在这里粘贴招聘 JD 内容...\n\n例如复制拉勾/BOSS直聘上的职位描述"}
          value={jdText}
          onChange={(e) => { setJdText(e.target.value); setResult(null); }}
          rows={8}
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 resize-none mb-4"
          aria-label="JD 文本内容"
        />
      )}

      {/* 上传模式 */}
      {inputMode === "upload" && (
        <div className="mb-4">
          {jdFile ? (
            <FileCard
              file={{ name: jdFile.name, size: jdFile.size }}
              onRemove={() => setJdFile(null)}
            />
          ) : (
            <FileDropzone
              accept={ALL_EXTENSIONS}
              maxSize={10 * 1024 * 1024}
              onSelect={(file) => { setJdFile(file); setResult(null); }}
              label="点击上传 JD 文件"
              hint="支持 PDF、DOCX、TXT、PNG、JPG 等格式 · 最大 10MB"
            />
          )}
        </div>
      )}

      <LoadingButton
        loading={loading}
        loadingText="AI 分析中..."
        icon={undefined}
        onClick={handleAnalyze}
        disabled={
          (inputMode === "paste" && !jdText.trim()) ||
          (inputMode === "upload" && !jdFile)
        }
        className="w-full bg-indigo-600 hover:bg-indigo-500 mb-6"
      >
        开始分析
      </LoadingButton>

      {result && (
        <>
          <Card className="border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500">🏢 公司</span>
                <p className="text-white mt-1">{result.company}</p>
              </div>
              <div>
                <span className="text-zinc-500">💼 岗位</span>
                <p className="text-white mt-1">{result.role}</p>
              </div>
              <div>
                <span className="text-zinc-500">💰 薪资</span>
                <p className="text-white mt-1">{result.salary}</p>
              </div>
              <div>
                <span className="text-zinc-500">🎓 学历</span>
                <p className="text-white mt-1">{result.education}</p>
              </div>
              <div className="col-span-2">
                <span className="text-zinc-500">📅 经验要求</span>
                <p className="text-white mt-1">{result.experience}</p>
              </div>
            </div>

            <div>
              <span className="text-sm text-zinc-500">技能要求</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
              </div>
            </div>

            <div>
              <span className="text-sm text-zinc-500">📝 岗位总结</span>
              <p className="text-sm text-zinc-300 mt-1 leading-relaxed">{result.summary}</p>
            </div>

            <div>
              <span className="text-sm text-zinc-500">🏷️ 关键词</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.keywords.map((k) => (
                  <Badge key={k} variant="outline" className="border-indigo-500/30 text-indigo-400">{k}</Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* 工作流连线 */}
          <div className="mt-4 p-4 rounded-lg border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">下一步：用这份 JD 匹配你的简历</p>
              <p className="text-xs text-zinc-500 mt-0.5">AI 从四个维度评分，指出优势和差距</p>
            </div>
            <Link
              href={`/match?jd=${encodeURIComponent(jdText || "")}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors shrink-0"
            >
              开始匹配 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
