import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDocument, chunkText } from "@/lib/document-parser";
import { success, error } from "@/lib/api-response";

const ALLOWED_TYPES = ["pdf", "docx", "doc", "txt"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(error("请选择要上传的文件"), { status: 400 });
    }

    // 校验文件格式
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_TYPES.includes(ext)) {
      return NextResponse.json(
        error(`不支持的文件格式 .${ext}，请上传 PDF、DOCX 或 TXT`),
        { status: 400 }
      );
    }

    // 校验文件大小
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        error("文件大小不能超过 5MB"),
        { status: 400 }
      );
    }

    // 解析文件
    const buffer = await file.arrayBuffer();
    const parsedExt = ext === "doc" ? "docx" : ext;
    const content = await parseDocument(buffer, parsedExt);

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
        fileType: parsedExt,
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
