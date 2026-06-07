import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { model } from "@/lib/ai";
import { streamText } from "ai";
import { error } from "@/lib/api-response";

/**
 * 关键词检索相关文本块
 */
async function findRelevantChunks(query: string, limit = 5) {
  // 提取关键词（中英文分词简化版）
  const keywords = query
    .split(/[\s,，。？！、；：""''()（）]+/)
    .filter((k) => k.length >= 2);

  if (keywords.length === 0) {
    // 无有效关键词，返回最近上传文档的前几个块
    const recentDoc = await prisma.document.findFirst({
      orderBy: { createdAt: "desc" },
      select: { filename: true, chunks: { take: limit, orderBy: { chunkIndex: "asc" } } },
    });
    if (!recentDoc) return [];
    return recentDoc.chunks.map((c) => ({
      content: c.content,
      filename: recentDoc.filename,
    }));
  }

  // 一次性加载所有文档和块（MVP 数据量小，可行）
  const docs = await prisma.document.findMany({
    select: { filename: true, chunks: true },
    take: 50,
  });

  // 展开所有块并评分
  interface ScoredChunk {
    content: string;
    filename: string;
    score: number;
  }
  const scored: ScoredChunk[] = [];
  for (const doc of docs) {
    for (const chunk of doc.chunks) {
      const matchCount = keywords.filter((kw) => chunk.content.includes(kw)).length;
      if (matchCount > 0) {
        scored.push({ content: chunk.content, filename: doc.filename, score: matchCount });
      }
    }
  }

  // 取 Top-N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => ({ content: s.content, filename: s.filename }));
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
    const systemPrompt = `你是一个专业的求职助手 AI。你正在帮助一位大四应届生准备求职。
你的回答基于用户上传的资料，资料如下：

${context || "（用户尚未上传任何资料）"}

请遵守以下规则：
1. 只基于上面的资料回答问题，不要编造信息
2. 如果资料中没有相关信息，诚实地说"根据你上传的资料，暂时没有找到相关信息"
3. 回答要简洁、准确、有帮助
4. 使用中文回答`;

    // 流式返回
    const result = streamText({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: query.trim() }],
    });

    return result.toTextStreamResponse();
  } catch (e) {
    console.error("知识库问答失败:", e);
    return NextResponse.json(
      error(e instanceof Error ? e.message : "AI 回答失败，请重试"),
      { status: 500 }
    );
  }
}
