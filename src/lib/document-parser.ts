/**
 * 文档解析服务 — 统一的文件→文本提取 + 文本分块
 *
 * 所有 API 路由（upload / jd-analyze / extract-text）共用此模块。
 */

import { ocrImage, extractImagesFromPDF } from "@/lib/ocr";

// CJS 模块在 Next.js ESM 中需要用 require
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require("mammoth") as {
  extractRawText: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
};

const IMAGE_TYPES = ["png", "jpg", "jpeg", "webp", "bmp"];

/**
 * 从文件 Buffer 中提取纯文本
 *
 * 支持格式：PDF（含扫描版 OCR 兜底）、DOCX/DOC、TXT、PNG/JPG 等图片
 * 失败时抛出 Error，由调用方处理
 */
export async function extractTextFromFile(
  buffer: ArrayBuffer,
  fileType: string
): Promise<string> {
  const ext = fileType.toLowerCase();

  // ── 图片 → OCR ──
  if (IMAGE_TYPES.includes(ext)) {
    const text = await ocrImage(Buffer.from(buffer));
    if (!text.trim()) {
      throw new Error("未能从图片中识别出文字，请确认图片清晰度或改用文字粘贴");
    }
    return text.trim();
  }

  // ── PDF ──
  if (ext === "pdf") {
    const pdfBuf = Buffer.from(buffer);
    const result = await pdfParse(pdfBuf);
    const text = result.text?.trim();
    if (text) return text;

    // 扫描版 PDF → OCR 兜底
    const images = extractImagesFromPDF(pdfBuf);
    if (images.length > 0) {
      const ocrTexts: string[] = [];
      for (const img of images) {
        const t = await ocrImage(img);
        if (t.trim()) ocrTexts.push(t.trim());
      }
      if (ocrTexts.length > 0) return ocrTexts.join("\n\n");
    }

    throw new Error("未能从 PDF 中提取文字，可能是扫描版 PDF，请截图后用图片格式上传");
  }

  // ── DOCX / DOC ──
  if (ext === "docx" || ext === "doc") {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    const text = result.value?.trim();
    if (!text) throw new Error("未能从文档中提取文字");
    return text;
  }

  // ── TXT ──
  if (ext === "txt" || ext === "text") {
    const text = new TextDecoder("utf-8").decode(buffer).trim();
    if (!text) throw new Error("文件内容为空");
    return text;
  }

  throw new Error(`不支持的文件格式: .${ext}`);
}

/**
 * 将长文本分割成多个块（用于 RAG 检索）
 */
export function chunkText(text: string, maxChars = 2000): string[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}
