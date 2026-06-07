import * as pdfjsLib from "pdfjs-dist";

// 配置 pdf.js worker（使用 CDN，避免 Serverless 打包问题）
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";

/**
 * 解析 PDF 文件，提取纯文本
 */
export async function parsePDF(buffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .filter((item) => "str" in item)
      .map((item) => (item as { str: string }).str)
      .filter((s) => s.trim().length > 0)
      .join(" ");
    pages.push(text);
  }

  return pages.join("\n\n");
}

/**
 * 解析 DOCX 文件，提取纯文本
 */
export async function parseDOCX(buffer: ArrayBuffer): Promise<string> {
  // 动态导入 mammoth（仅服务端可用）
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

/**
 * 解析 TXT 文本
 */
export function parseTXT(text: string): string {
  return text.trim();
}

/**
 * 统一文档解析入口
 * @param buffer 文件二进制内容
 * @param fileType 文件类型 (pdf | docx | txt)
 * @returns 解析后的纯文本
 */
export async function parseDocument(
  buffer: ArrayBuffer,
  fileType: string
): Promise<string> {
  switch (fileType.toLowerCase()) {
    case "pdf":
      return parsePDF(buffer);
    case "docx":
    case "doc":
      return parseDOCX(buffer);
    case "txt":
    case "text":
      return parseTXT(new TextDecoder("utf-8").decode(buffer));
    default:
      throw new Error(`不支持的文件格式: ${fileType}`);
  }
}

/**
 * 将长文本分割成多个块（用于 RAG 检索）
 * @param text 原始文本
 * @param maxChars 每块最大字符数
 * @returns 文本块数组
 */
export function chunkText(text: string, maxChars = 2000): string[] {
  // 按段落分割
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
