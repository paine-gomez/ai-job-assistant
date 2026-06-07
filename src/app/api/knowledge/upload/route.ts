import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTextFromFile, chunkText } from "@/lib/document-parser";
import { success, error } from "@/lib/api-response";
import { validateFile, ALL_EXTENSIONS } from "@/lib/file-utils";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(error("请选择要上传的文件"), { status: 400 });
    }

    // 使用共享校验工具
    const validation = validateFile(file, ALL_EXTENSIONS, MAX_SIZE);
    if (!validation.valid) {
      return NextResponse.json(error(validation.error!), { status: 400 });
    }

    // 使用统一的文本提取
    const buffer = await file.arrayBuffer();
    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    let content: string;
    try {
      content = await extractTextFromFile(buffer, ext);
    } catch (parseErr) {
      return NextResponse.json(
        error(parseErr instanceof Error ? parseErr.message : "文件解析失败"),
        { status: 400 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        error("未能从文件中提取到文字内容"),
        { status: 400 }
      );
    }

    // 文本分块
    const chunks = chunkText(content);

    // 存入数据库
    const doc = await prisma.document.create({
      data: {
        filename: file.name,
        content,
        fileType: ext,
        fileSize: file.size,
        chunkCount: chunks.length,
        chunks: {
          create: chunks.map((text, index) => ({
            content: text,
            chunkIndex: index,
            tokenCount: Math.ceil(text.length / 2),
          })),
        },
      },
    });

    return NextResponse.json(
      success({
        id: doc.id,
        filename: doc.filename,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        chunkCount: doc.chunkCount,
      })
    );
  } catch (e) {
    console.error("文件上传失败:", e);
    return NextResponse.json(
      error(e instanceof Error ? e.message : "文件上传失败，请重试"),
      { status: 500 }
    );
  }
}
