import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        filename: true,
        fileType: true,
        fileSize: true,
        chunkCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(success(documents));
  } catch (e) {
    console.error("获取文档列表失败:", e);
    return NextResponse.json(
      error("获取文档列表失败"),
      { status: 500 }
    );
  }
}
