"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Target, Lightbulb, AlertTriangle, CheckCircle2, Upload, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
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

export default function MatchPage() {
  const searchParams = useSearchParams();
  const { resume: savedResume, hasResume, isLoaded } = useResume();

  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractingResume, setExtractingResume] = useState(false);
  const [extractingJD, setExtractingJD] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  // 如果从 JD 分析页跳转过来，自动填入 JD 文本
  const passedJD = searchParams.get("jd");
  useEffect(() => {
    if (passedJD) setJdText(decodeURIComponent(passedJD));
  }, [passedJD]);

  // 自动填入已保存的简历（仅首次加载时触发）
  useEffect(() => {
    if (isLoaded && hasResume && !resumeText.trim() && !autoFilled) {
      setResumeText(savedResume);
      setAutoFilled(true);
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

    // 校验
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

  const scoreColor = (s: number) => (s >= 80 ? "text-green-400" : s >= 60 ? "text-yellow-400" : "text-red-400");
  const scoreBg = (s: number) => (s >= 80 ? "bg-green-400" : s >= 60 ? "bg-yellow-400" : "bg-red-400");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader
        title="简历匹配"
        description="上传或粘贴简历和目标 JD，AI 从四个维度评分并给出建议"
      />

      <div className="space-y-4">
        {/* 简历 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="resume-textarea" className="text-sm font-medium text-zinc-400">你的简历</label>
            <label className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
              {extractingResume ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {extractingResume ? "提取中..." : "上传文件"}
              <input ref={resumeFileInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp,.bmp" className="hidden"
                onChange={(e) => handleFileUpload(e, setResumeText, setExtractingResume)} disabled={extractingResume}
                aria-label="上传简历文件" />
            </label>
          </div>
          <Textarea
            id="resume-textarea"
            placeholder="粘贴简历内容，或点击右上角「上传文件」从 PDF/图片中提取文字"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={6}
            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 resize-none"
          />
        </div>

        {/* JD */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="jd-textarea" className="text-sm font-medium text-zinc-400">目标 JD</label>
            <label className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
              {extractingJD ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {extractingJD ? "提取中..." : "上传文件"}
              <input ref={jdFileInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp,.bmp" className="hidden"
                onChange={(e) => handleFileUpload(e, setJdText, setExtractingJD)} disabled={extractingJD}
                aria-label="上传 JD 文件" />
            </label>
          </div>
          <Textarea
            id="jd-textarea"
            placeholder="粘贴 JD 内容，或点击右上角「上传文件」从 PDF/图片中提取文字"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            rows={6}
            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 resize-none"
          />
        </div>

        {/* 引导提示：从 JD 页跳转过来但没有保存简历 */}
        {isLoaded && !hasResume && passedJD && (
          <div className="flex items-center justify-between rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
            <p className="text-xs text-zinc-400">
              💡 保存简历后，下次打开匹配页会自动填入，无需重复粘贴。
            </p>
            <button
              onClick={() => setResumeDialogOpen(true)}
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 shrink-0 ml-3 transition-colors"
            >
              <FileText className="h-3 w-3" /> 立即保存
            </button>
          </div>
        )}

        <LoadingButton
          loading={loading}
          loadingText="AI 分析中..."
          icon={Target}
          onClick={handleMatch}
          disabled={!resumeText.trim() || !jdText.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500"
        >
          开始匹配
        </LoadingButton>
      </div>

      {result && (
        <Card className="border-zinc-800 bg-zinc-900/50 p-6 space-y-6 mt-6">
          <div className="text-center">
            <p className="text-sm text-zinc-500 mb-2">综合匹配度</p>
            <p className={`text-5xl font-bold ${scoreColor(result.totalScore)}`} aria-label={`匹配度 ${result.totalScore} 分`}>
              {result.totalScore}
            </p>
            <p className="text-sm text-zinc-500 mt-1">/ 100</p>
          </div>

          <div className="space-y-3">
            {result.dimensions.map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-300">{d.name}</span>
                  <span className={scoreColor(d.score)}>{d.score}分</span>
                </div>
                <Progress value={d.score} className={`h-2 ${scoreBg(d.score)}`} aria-label={`${d.name} ${d.score} 分`} />
                <p className="text-xs text-zinc-500 mt-1">{d.comment}</p>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-sm font-medium text-green-400 flex items-center gap-2 mb-2"><CheckCircle2 className="h-4 w-4" /> 你的优势</h4>
            <ul className="space-y-1">
              {result.strengths.map((s, i) => <li key={i} className="text-sm text-zinc-300 pl-6">• {s}</li>)}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-yellow-400 flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4" /> 需要提升</h4>
            <ul className="space-y-1">
              {result.gaps.map((g, i) => <li key={i} className="text-sm text-zinc-300 pl-6">• {g}</li>)}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-indigo-400 flex items-center gap-2 mb-2"><Lightbulb className="h-4 w-4" /> 简历优化建议</h4>
            <ul className="space-y-1">
              {result.resumeSuggestions.map((s, i) => <li key={i} className="text-sm text-zinc-300 pl-6">• {s}</li>)}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-cyan-400 flex items-center gap-2 mb-2"><Target className="h-4 w-4" /> 面试准备建议</h4>
            <ul className="space-y-1">
              {result.interviewTips.map((t, i) => <li key={i} className="text-sm text-zinc-300 pl-6">• {t}</li>)}
            </ul>
          </div>
        </Card>
      )}

      <ResumeDialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen} />
    </div>
  );
}
