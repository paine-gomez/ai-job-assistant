import { NextResponse } from "next/server";
import { model } from "@/lib/ai";
import { generateText } from "ai";
import { success, error } from "@/lib/api-response";

const JD_ANALYSIS_PROMPT = `你是一位资深的 HR 和职业顾问。请分析以下招聘 JD，提取关键信息。

要求：
1. 如果某个字段 JD 中没有明确提到，填写 "未提及"
2. 返回严格合法的 JSON 格式，不要包含任何其他文字
3. 关键词标签提取 5-10 个核心技能/领域词

返回格式：
{
  "company": "公司名称",
  "role": "岗位名称",
  "salary": "薪资范围",
  "education": "学历要求",
  "experience": "经验要求",
  "skills": ["技能1", "技能2", ...],
  "responsibilities": ["职责1", "职责2", ...],
  "keywords": ["标签1", "标签2", ...],
  "summary": "3-5句话的岗位总结"
}`;

export async function POST(request: Request) {
  try {
    const { jdText } = await request.json();

    if (!jdText || typeof jdText !== "string" || jdText.trim().length === 0) {
      return NextResponse.json(error("请输入 JD 内容"), { status: 400 });
    }

    if (jdText.trim().length < 20) {
      return NextResponse.json(
        error("JD 内容太短，请粘贴完整的招聘信息"),
        { status: 400 }
      );
    }

    const { text } = await generateText({
      model,
      system: JD_ANALYSIS_PROMPT,
      messages: [
        {
          role: "user",
          content: `请分析以下 JD：\n\n${jdText.trim()}`,
        },
      ],
      temperature: 0.1, // 降低随机性，确保稳定输出
    });

    // 解析 AI 返回的 JSON
    let result;
    try {
      // 处理可能的 markdown 代码块包裹
      const jsonStr = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      result = JSON.parse(jsonStr);
    } catch {
      // JSON 解析失败，返回原始文本
      return NextResponse.json(
        error("AI 返回格式异常，请重试"),
        { status: 500 }
      );
    }

    return NextResponse.json(success(result));
  } catch (e) {
    console.error("JD 分析失败:", e);
    return NextResponse.json(
      error(e instanceof Error ? e.message : "JD 分析失败，请重试"),
      { status: 500 }
    );
  }
}
