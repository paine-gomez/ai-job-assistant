import { NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/document-parser";
import { success, error } from "@/lib/api-response";
import { validateFile, ALL_EXTENSIONS } from "@/lib/file-utils";

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(error("请选择文件"), { status: 400 });
    }

    const validation = validateFile(file, ALL_EXTENSIONS, MAX_SIZE);
    if (!validation.valid) {
      return NextResponse.json(error(validation.error!), { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const buffer = Buffer.from(await file.arrayBuffer());

    let text: string;
    try {
      text = await extractTextFromFile(buffer, ext);
    } catch (parseErr) {
      return NextResponse.json(
        error(parseErr instanceof Error ? parseErr.message : "文件解析失败"),
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(error("提取的文字内容为空"), { status: 400 });
    }

    return NextResponse.json(success({ text, filename: file.name }));
  } catch (e) {
    console.error("文本提取失败:", e);
    return NextResponse.json(
      error(e instanceof Error ? e.message : "文本提取失败"),
      { status: 500 }
    );
  }
}
