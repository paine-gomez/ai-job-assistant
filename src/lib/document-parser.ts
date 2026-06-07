/**
 * 解析 PDF 文件，提取纯文本
 */
// CJS 模块在 Next.js ESM 中需要用特殊方式导入
let _pdfParse: ((buf: Buffer) => Promise<{ text: string }>) | null = null;
async function getPdfParse() {
  if (!_pdfParse) {
    const mod = await import("pdf-parse") as any;
    _pdfParse = mod.default?.default || mod.default || mod;
  }
  return _pdfParse;
}

async function parsePDF(buffer: ArrayBuffer): Promise<string> {
  const pdfParse = await getPdfParse();
  const result = await pdfParse(Buffer.from(buffer));
  return result.text;
}

/**
 * 解析 DOCX 文件，提取纯文本
 */
async function parseDOCX(buffer: ArrayBuffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

/**
 * 解析 TXT 文本
 */
function parseTXT(text: string): string {
  return text.trim();
}

/**
 * 统一文档解析入口
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
