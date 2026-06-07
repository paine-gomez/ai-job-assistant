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

// ─── 面试题生成结果 ───
export interface InterviewQuestion {
  id: string;
  category: "resume" | "competency" | "behavioral";
  question: string;
  intent: string;
  approach: string;
}

export interface InterviewResult {
  role: string;
  categories: {
    resume: InterviewQuestion[];
    competency: InterviewQuestion[];
    behavioral: InterviewQuestion[];
  };
}

// ─── 自我介绍生成结果 ───
export interface IntroResult {
  role: string;
  shortVersion: string;
  longVersion: string;
  highlights: string[];
}
