/**
 * OCR 服务 —— 用 Tesseract.js 识别图片中的文字
 * 适用于图片型 PDF（扫描件等）
 */
import { createWorker } from "tesseract.js";

let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

async function getWorker() {
  if (!worker) {
    worker = await createWorker("chi_sim+eng");
  }
  return worker;
}

/**
 * 对图片 Buffer 进行 OCR 识别
 */
export async function ocrImage(imageBuffer: Buffer): Promise<string> {
  const w = await getWorker();
  const { data } = await w.recognize(imageBuffer);
  return data.text;
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
    // 去除末尾的 \r\n
    const cleanContent = streamContent.replace(/[\r\n]+$/, "");

    // 尝试检测是否为 JPEG（以 FF D8 FF 开头）
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

/**
 * OCR 整个 PDF：提取图片 → OCR 每张 → 合并文字
 */
export async function ocrPDF(pdfBuffer: Buffer): Promise<string> {
  const images = extractImagesFromPDF(pdfBuffer);

  if (images.length === 0) {
    return "";
  }

  const texts: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const text = await ocrImage(images[i]);
    if (text.trim()) {
      texts.push(text);
    }
  }

  return texts.join("\n\n--- 第 页 ---\n\n");
}
