import { NextResponse } from "next/server";
import { deepseekChat, parseAIJson } from "@/lib/ai";
import { extractTextFromFile } from "@/lib/document-parser";
import { JD_ANALYSIS_PROMPT } from "@/lib/prompts";
import { success, error } from "@/lib/api-response";
import { validateFile, ALL_EXTENSIONS } from "@/lib/file-utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // ── 方式一：上传文件 ──
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(error("请选择要上传的文件"), { status: 400 });
      }

      const validation = validateFile(file, ALL_EXTENSIONS, MAX_FILE_SIZE);
      if (!validation.valid) {
        return NextResponse.json(error(validation.error!), { status: 400 });
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      let jdText: string;
      try {
        const buffer = await file.arrayBuffer();
        jdText = await extractTextFromFile(buffer, ext);
      } catch (parseErr) {
        return NextResponse.json(
          error(parseErr instanceof Error ? parseErr.message : "文件解析失败"),
          { status: 400 }
        );
      }

      if (jdText.length < 20) {
        return NextResponse.json(
          error("提取的文字内容太短，可能不是有效的 JD 文件"),
          { status: 400 }
        );
      }

      try {
        const aiText = await deepseekChat(JD_ANALYSIS_PROMPT, `请分析以下 JD：\n\n${jdText}`, { temperature: 0.1 });
        const result = parseAIJson(aiText);
        return NextResponse.json(success(result));
      } catch {
        return NextResponse.json(error("AI 返回格式异常，请重试"), { status: 500 });
      }
    }

    // ── 方式二：粘贴文本 ──
    const { jdText } = await request.json();

    if (!jdText || typeof jdText !== "string" || jdText.trim().length === 0) {
      return NextResponse.json(error("请输入 JD 内容或上传 JD 文件"), { status: 400 });
    }

    if (jdText.trim().length < 20) {
      return NextResponse.json(error("JD 内容太短，请粘贴完整的招聘信息"), { status: 400 });
    }

    try {
      const aiText = await deepseekChat(JD_ANALYSIS_PROMPT, `请分析以下 JD：\n\n${jdText.trim()}`, { temperature: 0.1 });
      const result = parseAIJson(aiText);
      return NextResponse.json(success(result));
    } catch {
      return NextResponse.json(error("AI 返回格式异常，请重试"), { status: 500 });
    }
  } catch (e) {
    console.error("JD 分析失败:", e);
    return NextResponse.json(
      error(e instanceof Error ? e.message : "JD 分析失败，请重试"),
      { status: 500 }
    );
  }
}
