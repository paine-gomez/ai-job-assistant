import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deepseekChatStream } from "@/lib/ai";
import { buildKnowledgeSystemPrompt } from "@/lib/prompts";
import { error } from "@/lib/api-response";

/**
 * 中文关键词提取：二元组分词 + 标点分隔
 */
function extractKeywords(query: string): string[] {
  const keywords: string[] = [];

  const segments = query.split(/[\s,，。？！、；：""''()（）]+/);
  for (const seg of segments) {
    if (seg.length >= 2) keywords.push(seg);
  }

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

  const docs = await prisma.document.findMany({
    select: {
      filename: true,
      chunks: { orderBy: { chunkIndex: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (docs.length === 0) return [];

  const allChunks = docs.flatMap((doc) =>
    doc.chunks.map((chunk) => ({
      content: chunk.content,
      filename: doc.filename,
    }))
  );

  if (allChunks.length <= limit) return allChunks;

  if (keywords.length > 0) {
    const scored = allChunks.map((chunk) => ({
      ...chunk,
      score: keywords.filter((kw) => chunk.content.includes(kw)).length,
    }));

    if (scored.some((s) => s.score > 0)) {
      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ content, filename }) => ({ content, filename }));
    }
  }

  return allChunks.slice(0, limit);
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(error("请输入问题"), { status: 400 });
    }

    const chunks = await findRelevantChunks(query.trim());
    const context = chunks
      .map((c) => `[来源: ${c.filename}]\n${c.content}`)
      .join("\n\n---\n\n");

    const systemPrompt = buildKnowledgeSystemPrompt(context);

    const deepseekResponse = await deepseekChatStream(systemPrompt, query.trim());

    if (!deepseekResponse.ok) {
      const errText = await deepseekResponse.text();
      return NextResponse.json(error(`AI 服务异常: ${errText}`), { status: 502 });
    }

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
