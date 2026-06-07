"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Sparkles, FileSearch, Lightbulb, Target, AlertTriangle, CheckCircle2 } from "lucide-react";

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

interface MatchResult {
  totalScore: number;
  dimensions: { name: string; score: number; comment: string }[];
  strengths: string[];
  gaps: string[];
  resumeSuggestions: string[];
  interviewTips: string[];
}

export default function ToolsPage() {
  // JD 分析
  const [jdText, setJdText] = useState("");
  const [jdResult, setJdResult] = useState<JDAnalysis | null>(null);
  const [jdLoading, setJdLoading] = useState(false);

  // 简历匹配
  const [resumeText, setResumeText] = useState("");
  const [matchJdText, setMatchJdText] = useState("");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);

  const handleJDAnalyze = async () => {
    if (!jdText.trim()) {
      toast.error("请先粘贴 JD 内容");
      return;
    }
    setJdLoading(true);
    setJdResult(null);
    try {
      const res = await fetch("/api/jd/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText }),
      });
      const json = await res.json();
      if (json.success) {
        setJdResult(json.data);
        toast.success("分析完成");
      } else {
        toast.error(json.error || "分析失败");
      }
    } catch {
      toast.error("网络错误，请重试");
    } finally {
      setJdLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!resumeText.trim()) {
      toast.error("请提供简历内容");
      return;
    }
    if (!matchJdText.trim()) {
      toast.error("请提供 JD 内容");
      return;
    }
    setMatchLoading(true);
    setMatchResult(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jdText: matchJdText }),
      });
      const json = await res.json();
      if (json.success) {
        setMatchResult(json.data);
        toast.success("匹配分析完成");
      } else {
        toast.error(json.error || "匹配失败");
      }
    } catch {
      toast.error("网络错误，请重试");
    } finally {
      setMatchLoading(false);
    }
  };

  // 分数颜色
  const scoreColor = (s: number) => (s >= 80 ? "text-green-400" : s >= 60 ? "text-yellow-400" : "text-red-400");
  const scoreBg = (s: number) => (s >= 80 ? "bg-green-400" : s >= 60 ? "bg-yellow-400" : "bg-red-400");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Tabs defaultValue="jd" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
          <TabsTrigger value="jd" className="data-[state=active]:bg-zinc-800">
            <FileSearch className="h-4 w-4 mr-2" />
            JD 分析
          </TabsTrigger>
          <TabsTrigger value="match" className="data-[state=active]:bg-zinc-800">
            <Target className="h-4 w-4 mr-2" />
            简历匹配
          </TabsTrigger>
        </TabsList>

        {/* JD 分析 Tab */}
        <TabsContent value="jd" className="mt-6 space-y-6">
          <Textarea
            placeholder="在这里粘贴招聘 JD 内容...&#10;&#10;例如复制拉勾/BOSS直聘上的职位描述"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            rows={8}
            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 resize-none"
          />
          <Button
            onClick={handleJDAnalyze}
            disabled={jdLoading || !jdText.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500"
          >
            {jdLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {jdLoading ? "AI 分析中..." : "开始分析"}
          </Button>

          {jdResult && (
            <Card className="border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">🏢 公司</span>
                  <p className="text-white mt-1">{jdResult.company}</p>
                </div>
                <div>
                  <span className="text-zinc-500">💼 岗位</span>
                  <p className="text-white mt-1">{jdResult.role}</p>
                </div>
                <div>
                  <span className="text-zinc-500">💰 薪资</span>
                  <p className="text-white mt-1">{jdResult.salary}</p>
                </div>
                <div>
                  <span className="text-zinc-500">🎓 学历</span>
                  <p className="text-white mt-1">{jdResult.education}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-zinc-500">📅 经验要求</span>
                  <p className="text-white mt-1">{jdResult.experience}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-zinc-500">技能要求</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {jdResult.skills.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm text-zinc-500">📝 岗位总结</span>
                <p className="text-sm text-zinc-300 mt-1 leading-relaxed">{jdResult.summary}</p>
              </div>

              <div>
                <span className="text-sm text-zinc-500">🏷️ 关键词</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {jdResult.keywords.map((k) => (
                    <Badge key={k} variant="outline" className="border-indigo-500/30 text-indigo-400">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* 简历匹配 Tab */}
        <TabsContent value="match" className="mt-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-2 block">你的简历</label>
            <Textarea
              placeholder="粘贴你的简历内容，或直接输入关键信息（教育背景、技能、项目经历等）"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={6}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-2 block">目标 JD</label>
            <Textarea
              placeholder="粘贴目标岗位的 JD 内容"
              value={matchJdText}
              onChange={(e) => setMatchJdText(e.target.value)}
              rows={6}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 resize-none"
            />
          </div>
          <Button
            onClick={handleMatch}
            disabled={matchLoading || !resumeText.trim() || !matchJdText.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500"
          >
            {matchLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Target className="h-4 w-4 mr-2" />
            )}
            {matchLoading ? "AI 分析中..." : "开始匹配"}
          </Button>

          {matchResult && (
            <Card className="border-zinc-800 bg-zinc-900/50 p-6 space-y-6">
              {/* 总分 */}
              <div className="text-center">
                <p className="text-sm text-zinc-500 mb-2">综合匹配度</p>
                <p className={`text-5xl font-bold ${scoreColor(matchResult.totalScore)}`}>
                  {matchResult.totalScore}
                </p>
                <p className="text-sm text-zinc-500 mt-1">/ 100</p>
              </div>

              {/* 各维度 */}
              <div className="space-y-3">
                {matchResult.dimensions.map((d) => (
                  <div key={d.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-300">{d.name}</span>
                      <span className={scoreColor(d.score)}>{d.score}分</span>
                    </div>
                    <Progress value={d.score} className={`h-2 ${scoreBg(d.score)}`} />
                    <p className="text-xs text-zinc-500 mt-1">{d.comment}</p>
                  </div>
                ))}
              </div>

              {/* 优势 */}
              <div>
                <h4 className="text-sm font-medium text-green-400 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4" /> 你的优势
                </h4>
                <ul className="space-y-1">
                  {matchResult.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-zinc-300 pl-6">• {s}</li>
                  ))}
                </ul>
              </div>

              {/* 差距 */}
              <div>
                <h4 className="text-sm font-medium text-yellow-400 flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" /> 需要提升
                </h4>
                <ul className="space-y-1">
                  {matchResult.gaps.map((g, i) => (
                    <li key={i} className="text-sm text-zinc-300 pl-6">• {g}</li>
                  ))}
                </ul>
              </div>

              {/* 简历优化建议 */}
              <div>
                <h4 className="text-sm font-medium text-indigo-400 flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4" /> 简历优化建议
                </h4>
                <ul className="space-y-1">
                  {matchResult.resumeSuggestions.map((s, i) => (
                    <li key={i} className="text-sm text-zinc-300 pl-6">• {s}</li>
                  ))}
                </ul>
              </div>

              {/* 面试建议 */}
              <div>
                <h4 className="text-sm font-medium text-cyan-400 flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4" /> 面试准备建议
                </h4>
                <ul className="space-y-1">
                  {matchResult.interviewTips.map((t, i) => (
                    <li key={i} className="text-sm text-zinc-300 pl-6">• {t}</li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
