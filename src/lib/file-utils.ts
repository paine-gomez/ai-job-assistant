/**
 * 文件工具函数 — 校验、格式化
 */

const DEFAULT_ACCEPT = ["pdf", "docx", "doc", "txt", "png", "jpg", "jpeg", "webp", "bmp"];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 校验文件格式和大小
 */
export function validateFile(
  file: File,
  accept: string[] = DEFAULT_ACCEPT,
  maxSize: number = 5 * 1024 * 1024
): FileValidationResult {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!accept.includes(ext)) {
    return { valid: false, error: `不支持 .${ext} 格式，支持 ${accept.map((e) => e.toUpperCase()).join("、")}` };
  }
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return { valid: false, error: `文件大小不能超过 ${maxMB}MB` };
  }
  return { valid: true };
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null) return "未知大小";
  if (bytes > 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes > 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${bytes} B`;
}

/**
 * 获取文件扩展名（大写）
 */
export function getFileExtension(filename: string): string {
  return (filename.split(".").pop() || "").toUpperCase();
}

/**
 * 通用文件格式 accept 字符串（用于 input[type=file]）
 */
export const ALL_FILE_ACCEPT = ".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp,.bmp";
export const DOCUMENT_ACCEPT = ".pdf,.docx,.doc,.txt";
export const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.webp,.bmp";
export const ALL_EXTENSIONS = DEFAULT_ACCEPT;
