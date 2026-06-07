import { NextResponse } from "next/server";
import { model } from "@/lib/ai";
import { generateText } from "ai";
import { success, error } from "@/lib/api-response";

const MATCH_PROMPT = `你是一位资深的职业规划顾问和 HR 专家。你需要评估一位求职者的简历与目标岗位 JD 的匹配程度。

请从以下四个维度进行评分（每个维度 0-100 分）：
1. 技能匹配度：技能要求是否对应
2. 经验匹配度：工作经验是否相关
3. 学历匹配度：学历背景是否符合
4. 综合素质匹配度：软实力、行业认知等

同时给出：
- 3-5 个优势项（求职者做得好的地方）
- 3-5 个差距项（需要提升的地方）
- 3-5 条简历优化建议
- 2-3 条面试准备建议

注意：
- 这是一位应届生求职者，工作经验不足是正常的，不要因此过分压低分数
- 重点看潜力、学习能力和技能匹配
- 评分要合理，避免极端分数（除非非常明显）

返回严格合法的 JSON 格式：
{
  "totalScore": 72,
  "dimensions": [
    { "name": "技能匹配度", "score": 80, "comment": "简短评语" },
    { "name": "经验匹配度", "score": 60, "comment": "简短评语" },
    { "name": "学历匹配度", "score": 85, "comment": "简短评语" },
    { "name": "综合素质匹配度", "score": 65, "comment": "简短评语" }
  ],
  "strengths": ["优势1", "优势2"],
  "gaps": ["差距1", "差距2"],
  "resumeSuggestions": ["建议1", "建议2"],
  "interviewTips": ["面试建议1", "面试建议2"]
}`;

export async function POST(request: Request) {
  try {
    const { resumeText, jdText } = await request.json();

    // 校验
    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length === 0) {
      return NextResponse.json(error("请提供简历内容"), { status: 400 });
    }
    if (!jdText || typeof jdText !== "string" || jdText.trim().length === 0) {
      return NextResponse.json(error("请提供 JD 内容"), { status: 400 });
    }

    const userMessage = `## 求职者简历
${resumeText.trim()}

## 目标岗位 JD
${jdText.trim()}

请对以上简历和 JD 进行匹配分析。`;

    const { text } = await generateText({
      model,
      system: MATCH_PROMPT,
      messages: [{ role: "user", content: userMessage }],
      temperature: 0.3,
    });

    // 解析 JSON
    let result;
    try {
      const jsonStr = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      result = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        error("AI 返回格式异常，请重试"),
        { status: 500 }
      );
    }

    return NextResponse.json(success(result));
  } catch (e) {
    console.error("简历匹配失败:", e);
    return NextResponse.json(
      error(e instanceof Error ? e.message : "匹配分析失败，请重试"),
      { status: 500 }
    );
  }
}
