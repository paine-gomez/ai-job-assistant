import { NextResponse } from "next/server";
import { ocrImage, extractImagesFromPDF } from "@/lib/ocr";
import { success, error } from "@/lib/api-response";

// CJS 模块
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require("mammoth") as { extractRawText: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> };

const ALLOWED_TYPES = ["pdf", "docx", "doc", "txt", "png", "jpg", "jpeg", "webp", "bmp"];
const IMAGE_TYPES = ["png", "jpg", "jpeg", "webp", "bmp"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(error("请选择文件"), { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_TYPES.includes(ext)) {
      return NextResponse.json(
        error(`不支持 .${ext} 格式，支持 PDF、DOCX、TXT、PNG、JPG 等`),
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(error("文件大小不能超过 10MB"), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let text = "";

    // 图片 → OCR
    if (IMAGE_TYPES.includes(ext)) {
      text = await ocrImage(buffer);
      if (!text.trim()) {
        return NextResponse.json(
          error("未能从图片中识别出文字，请确认图片清晰度"),
          { status: 400 }
        );
      }
    }
    // PDF
    else if (ext === "pdf") {
      const result = await pdfParse(buffer);
      text = result.text?.trim() || "";

      // 扫描版 PDF → OCR 兜底
      if (!text) {
        const images = extractImagesFromPDF(buffer);
        const ocrTexts: string[] = [];
        for (const img of images) {
          const t = await ocrImage(img);
          if (t.trim()) ocrTexts.push(t.trim());
        }
        text = ocrTexts.join("\n\n");
      }

      if (!text.trim()) {
        return NextResponse.json(
          error("未能从 PDF 中提取文字，请截图后用图片格式上传"),
          { status: 400 }
        );
      }
    }
    // DOCX
    else if (ext === "docx" || ext === "doc") {
      const result = await mammoth.extractRawText({ arrayBuffer: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) });
      text = result.value?.trim() || "";
      if (!text) {
        return NextResponse.json(error("未能从文档中提取文字"), { status: 400 });
      }
    }
    // TXT
    else {
      text = new TextDecoder("utf-8").decode(buffer).trim();
      if (!text) {
        return NextResponse.json(error("文件内容为空"), { status: 400 });
      }
    }

    return NextResponse.json(success({ text, filename: file.name }));
  } catch (e) {
    console.error("文本提取失败:", e);
    return NextResponse.json(
      error(e instanceof Error ? e.message : "文本提取失败"),
      { status: 500 }
    );
  }
}
