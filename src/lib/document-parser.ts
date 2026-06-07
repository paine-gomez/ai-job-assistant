/**
 * 解析 PDF 文件，提取纯文本
 */
async function parsePDF(buffer: ArrayBuffer): Promise<string> {
  const pdfParse = await import("pdf-parse");
  // pdf-parse 需要 Node.js Buffer
  const result = await pdfParse.default(Buffer.from(buffer));
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
