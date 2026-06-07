/**
 * OCR 服务 —— 用 Tesseract.js 识别图片中的文字
 *
 * Tesseract.js v7 会使用自带的 Worker（无需指定路径），
 * 语言包从默认 CDN 自动下载并缓存。
 */
import { createWorker } from "tesseract.js";

let workerPromise: ReturnType<typeof createWorker> | null = null;

async function getWorker() {
  if (!workerPromise) {
    // v7 不需要手动指定 workerPath，使用内置 Worker 即可
    workerPromise = createWorker("chi_sim+eng");
  }
  return workerPromise;
}

/**
 * 对图片 Buffer 进行 OCR 识别
 * 失败时抛出明确错误信息，方便上层处理
 */
export async function ocrImage(imageBuffer: Buffer): Promise<string> {
  try {
    const worker = await getWorker();
    const { data } = await worker.recognize(imageBuffer);
    return data.text;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("OCR 识别失败:", msg);

    // 根据错误类型给出更友好的提示
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("fetch")) {
      throw new Error("OCR 语言包加载失败（网络问题），请尝试用文字粘贴方式输入 JD");
    }
    if (msg.includes("timeout") || msg.includes("Timeout")) {
      throw new Error("OCR 识别超时，图片可能过大，请压缩后重试或改用文字粘贴");
    }
    throw new Error(`图片识别失败: ${msg}`);
  }
}

/**
 * 从 PDF Buffer 中提取内嵌的 JPEG 图片
 * 图片型 PDF 通常内嵌 DCTDecode（JPEG）格式的图片流
 */
export function extractImagesFromPDF(pdfBuffer: Buffer): Buffer[] {
  const images: Buffer[] = [];
  const data = pdfBuffer.toString("binary");

  // 匹配 PDF 流对象:  stream ... endstream
  const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
  let match;

  while ((match = streamRegex.exec(data)) !== null) {
    const streamContent = match[1];
    const cleanContent = streamContent.replace(/[\r\n]+$/, "");

    // 检测是否为 JPEG（以 FF D8 FF 开头）
    const binaryContent = Buffer.from(cleanContent, "binary");
    if (
      binaryContent.length > 3 &&
      binaryContent[0] === 0xff &&
      binaryContent[1] === 0xd8 &&
      binaryContent[2] === 0xff
    ) {
      images.push(binaryContent);
    }
  }

  return images;
}
