import { NextResponse } from "next/server";
import { deepseekChat } from "@/lib/ai";
import { ocrImage, extractImagesFromPDF } from "@/lib/ocr";
import { success, error } from "@/lib/api-response";

// CJS 模块在 Next.js ESM 中需要用 require
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require("mammoth") as { extractRawText: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> };

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

const ALLOWED_FILE_TYPES = ["pdf", "docx", "doc", "txt", "png", "jpg", "jpeg", "webp", "bmp"];
const IMAGE_TYPES = ["png", "jpg", "jpeg", "webp", "bmp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB（JD 文件允许大一些，可能有图片截图）

/**
 * 从上传文件中提取文本
 */
async function extractTextFromFile(buffer: ArrayBuffer, fileType: string): Promise<string> {
  const ext = fileType.toLowerCase();

  // 图片 → OCR
  if (IMAGE_TYPES.includes(ext)) {
    const text = await ocrImage(Buffer.from(buffer));
    if (!text.trim()) {
      throw new Error("未能从图片中识别出文字，请确认图片清晰度或改用文字粘贴");
    }
    return text.trim();
  }

  // PDF
  if (ext === "pdf") {
    const pdfBuf = Buffer.from(buffer);
    const result = await pdfParse(pdfBuf);
    const text = result.text?.trim();
    if (text) return text;

    // 文字为空 → 尝试 OCR（扫描版 PDF）
    const images = extractImagesFromPDF(pdfBuf);
    if (images.length > 0) {
      const ocrTexts: string[] = [];
      for (const img of images) {
        const t = await ocrImage(img);
        if (t.trim()) ocrTexts.push(t.trim());
      }
      if (ocrTexts.length > 0) {
        return ocrTexts.join("\n\n");
      }
    }

    throw new Error("未能从 PDF 中提取文字，可能是扫描版 PDF，请截图后用图片格式上传");
  }

  // DOCX / DOC
  if (ext === "docx" || ext === "doc") {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    const text = result.value?.trim();
    if (!text) {
      throw new Error("未能从文档中提取文字");
    }
    return text;
  }

  // TXT
  if (ext === "txt" || ext === "text") {
    const text = new TextDecoder("utf-8").decode(buffer).trim();
    if (!text) {
      throw new Error("文件内容为空");
    }
    return text;
  }

  throw new Error(`不支持的文件格式: .${ext}`);
}

/**
 * 调用 AI 分析 JD 文本
 */
async function analyzeJDText(jdText: string) {
  const text = await deepseekChat(
    JD_ANALYSIS_PROMPT,
    `请分析以下 JD：\n\n${jdText}`,
    { temperature: 0.1 }
  );

  // 解析 AI 返回的 JSON
  const jsonStr = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  return JSON.parse(jsonStr);
}

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

      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!ALLOWED_FILE_TYPES.includes(ext)) {
        return NextResponse.json(
          error(`不支持的文件格式 .${ext}，支持 PDF、DOCX、TXT、PNG、JPG 等`),
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          error("文件大小不能超过 10MB"),
          { status: 400 }
        );
      }

      // 提取文字
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

      // AI 分析
      const result = await analyzeJDText(jdText);
      return NextResponse.json(success(result));
    }

    // ── 方式二：粘贴文本 ──
    const { jdText } = await request.json();

    if (!jdText || typeof jdText !== "string" || jdText.trim().length === 0) {
      return NextResponse.json(error("请输入 JD 内容或上传 JD 文件"), { status: 400 });
    }

    if (jdText.trim().length < 20) {
      return NextResponse.json(
        error("JD 内容太短，请粘贴完整的招聘信息"),
        { status: 400 }
      );
    }

    const result = await analyzeJDText(jdText.trim());
    return NextResponse.json(success(result));
  } catch (e) {
    console.error("JD 分析失败:", e);
    return NextResponse.json(
      error(e instanceof Error ? e.message : "JD 分析失败，请重试"),
      { status: 500 }
    );
  }
}
