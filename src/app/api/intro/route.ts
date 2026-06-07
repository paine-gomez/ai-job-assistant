import { NextResponse } from "next/server";
import { deepseekChat, parseAIJson } from "@/lib/ai";
import { SELF_INTRO_PROMPT } from "@/lib/prompts";
import { success, error } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const { resumeText, jdText } = await request.json();

    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length === 0) {
      return NextResponse.json(error("请提供简历内容"), { status: 400 });
    }

    const hasJD = jdText && typeof jdText === "string" && jdText.trim().length > 0;

    const userMessage = hasJD
      ? `## 求职者简历\n${resumeText.trim()}\n\n## 目标岗位 JD\n${jdText.trim()}\n\n请根据以上信息生成自我介绍。`
      : `## 求职者简历\n${resumeText.trim()}\n\n（求职者尚未提供具体目标 JD，请根据简历内容生成面向同方向的通用自我介绍）`;

    const aiText = await deepseekChat(SELF_INTRO_PROMPT, userMessage, { temperature: 0.8 });

    try {
      const result = parseAIJson(aiText);
      return NextResponse.json(success(result));
    } catch {
      return NextResponse.json(error("AI 返回格式异常，请重试"), { status: 500 });
    }
  } catch (e) {
    console.error("自我介绍生成失败:", e);
    return NextResponse.json(
      error(e instanceof Error ? e.message : "自我介绍生成失败，请重试"),
      { status: 500 }
    );
  }
}
