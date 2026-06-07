import { NextResponse } from "next/server";
import { deepseekChat, parseAIJson } from "@/lib/ai";
import { MATCH_PROMPT } from "@/lib/prompts";
import { success, error } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const { resumeText, jdText } = await request.json();

    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length === 0) {
      return NextResponse.json(error("请提供简历内容"), { status: 400 });
    }
    if (!jdText || typeof jdText !== "string" || jdText.trim().length === 0) {
      return NextResponse.json(error("请提供 JD 内容"), { status: 400 });
    }

    const userMessage = `## 求职者简历\n${resumeText.trim()}\n\n## 目标岗位 JD\n${jdText.trim()}\n\n请对以上简历和 JD 进行匹配分析。`;

    const aiText = await deepseekChat(MATCH_PROMPT, userMessage, { temperature: 0.3 });

    try {
      const result = parseAIJson(aiText);
      return NextResponse.json(success(result));
    } catch {
      return NextResponse.json(error("AI 返回格式异常，请重试"), { status: 500 });
    }
  } catch (e) {
    console.error("简历匹配失败:", e);
    return NextResponse.json(
      error(e instanceof Error ? e.message : "匹配分析失败，请重试"),
      { status: 500 }
    );
  }
}
