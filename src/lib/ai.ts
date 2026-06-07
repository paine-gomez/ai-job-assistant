const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
const DEEPSEEK_BASE = "https://api.deepseek.com/v1";

/**
 * 调用 DeepSeek Chat API（非流式）
 */
export async function deepseekChat(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API 错误 (${res.status}): ${err}`);
  }

  const json = await res.json();
  return json.choices[0]?.message?.content || "";
}

/**
 * 调用 DeepSeek Chat API（流式）
 * 返回 Response，body 为 SSE 流
 */
export function deepseekChatStream(
  systemPrompt: string,
  userMessage: string
): Promise<Response> {
  return fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    }),
  });
}

/**
 * 从 AI 返回文本中解析 JSON
 * 处理常见的 markdown 代码块包裹（```json ... ```）
 */
export function parseAIJson(text: string): unknown {
  const jsonStr = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  return JSON.parse(jsonStr);
}
