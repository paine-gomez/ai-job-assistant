import { createOpenAI } from "@ai-sdk/openai";

// 使用 DeepSeek API（兼容 OpenAI 接口）
const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

// 默认模型：DeepSeek Chat（性价比最高）
export const model = deepseek("deepseek-chat");

// 备用：带 reasoning 的模型（用于复杂匹配分析）
export const reasoningModel = deepseek("deepseek-reasoner");
