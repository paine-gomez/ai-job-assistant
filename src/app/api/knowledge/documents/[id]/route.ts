import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) {
      return NextResponse.json(error("文档不存在"), { status: 404 });
    }

    // 级联删除（chunks 会因 onDelete: Cascade 自动删除）
    await prisma.document.delete({ where: { id } });

    return NextResponse.json(success({ id, filename: doc.filename }));
  } catch (e) {
    console.error("删除文档失败:", e);
    return NextResponse.json(
      error("删除文档失败"),
      { status: 500 }
    );
  }
}
