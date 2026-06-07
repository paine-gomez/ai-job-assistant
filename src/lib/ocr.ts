/**
 * OCR 服务 —— 用 Tesseract.js 识别图片中的文字
 * 通过 CDN 加载 Worker 和语言包，避免 Next.js 打包问题
 */
import { createWorker } from "tesseract.js";

let workerPromise: ReturnType<typeof createWorker> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("chi_sim+eng", 1, {
      workerPath: "https://unpkg.com/tesseract.js@7/dist/worker.min.js",
      langPath: "https://tessdata.maintained.org/4.0.0",
    });
  }
  return workerPromise;
}

/**
 * 对图片 Buffer 进行 OCR 识别
 */
export async function ocrImage(imageBuffer: Buffer): Promise<string> {
  try {
    const worker = await getWorker();
    const { data } = await worker.recognize(imageBuffer);
    return data.text;
  } catch (e) {
    console.error("OCR 识别失败:", e);
    return "";
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
