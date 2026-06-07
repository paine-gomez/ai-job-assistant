// ─── 文档相关 ───
export interface DocumentItem {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number | null;
  chunkCount: number;
  createdAt: string;
}

// ─── JD 分析结果 ───
export interface JDAnalysis {
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

// ─── 简历匹配结果 ───
export interface MatchDimension {
  name: string;
  score: number;
  comment: string;
}

export interface MatchResult {
  totalScore: number;
  dimensions: MatchDimension[];
  strengths: string[];
  gaps: string[];
  resumeSuggestions: string[];
  interviewTips: string[];
}

// ─── 对话消息 ───
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
