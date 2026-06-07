/**
 * 统一 API 响应格式
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export function success<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function error(message: string): ApiResponse<never> {
  return { success: false, error: message };
}
