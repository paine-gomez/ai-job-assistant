import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deepseekChatStream } from "@/lib/ai";
import { error } from "@/lib/api-response";

/**
 * 中文关键词提取：二元组分词 + 标点分隔
 */
function extractKeywords(query: string): string[] {
  const keywords: string[] = [];

  // 标点分隔提取长词
  const segments = query.split(/[\s,，。？！、；：""''()（）]+/);
  for (const seg of segments) {
    if (seg.length >= 2) keywords.push(seg);
  }

  // 中文二元组
  const chineseOnly = query.replace(/[^一-鿿]/g, "");
  for (let i = 0; i < chineseOnly.length - 1; i++) {
    keywords.push(chineseOnly.substring(i, i + 2));
  }

  return [...new Set(keywords)];
}

/**
 * 检索相关文本块 — 在所有文档中搜索，按关键词匹配度排序
 */
async function findRelevantChunks(query: string, limit = 20) {
  const keywords = extractKeywords(query);

  // 获取所有文档及其文本块
  const docs = await prisma.document.findMany({
    select: {
      filename: true,
      chunks: { orderBy: { chunkIndex: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (docs.length === 0) return [];

  // 收集所有文本块，标注来源文档
  const allChunks = docs.flatMap((doc) =>
    doc.chunks.map((chunk) => ({
      content: chunk.content,
      filename: doc.filename,
    }))
  );

  // 总块数不超过 limit 时直接返回全部
  if (allChunks.length <= limit) return allChunks;

  // 有关键词时按匹配度排序
  if (keywords.length > 0) {
    const scored = allChunks.map((chunk) => ({
      ...chunk,
      score: keywords.filter((kw) => chunk.content.includes(kw)).length,
    }));

    // 有任意匹配 → 取 Top-N
    if (scored.some((s) => s.score > 0)) {
      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ content, filename }) => ({ content, filename }));
    }
  }

  // 无关键词匹配时，按文档新旧 + 块顺序返回（优先新文档的前几块）
  return allChunks.slice(0, limit);
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(error("请输入问题"), { status: 400 });
    }

    // 检索相关文本块
    const chunks = await findRelevantChunks(query.trim());
    const context = chunks
      .map((c) => `[来源: ${c.filename}]\n${c.content}`)
      .join("\n\n---\n\n");

    // 构建 System Prompt
    const systemPrompt = `你是一位资深职业规划顾问，正在帮助应届生分析求职方向。

以下是该学生的简历资料：
${context || "（用户尚未上传任何资料）"}

请基于这份资料，提供专业、有帮助的分析。如果资料确实完全无法回答某个问题，说"资料中暂时没有涉及这方面信息"。否则，请尽力从资料中提取线索并给出有价值的建议。使用中文回答。`;

    // 流式返回
    const deepseekResponse = await deepseekChatStream(systemPrompt, query.trim());

    if (!deepseekResponse.ok) {
      const errText = await deepseekResponse.text();
      return NextResponse.json(error(`AI 服务异常: ${errText}`), { status: 502 });
    }

    // 将 DeepSeek 的 SSE 流转发给前端
    return new Response(deepseekResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("知识库问答失败:", e);
    return NextResponse.json(
      error(e instanceof Error ? e.message : "AI 回答失败，请重试"),
      { status: 500 }
    );
  }
}
