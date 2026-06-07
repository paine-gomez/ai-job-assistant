"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { FileCard } from "@/components/shared/file-card";
import { BouncingDots } from "@/components/shared/bouncing-dots";
import { ALL_EXTENSIONS } from "@/lib/file-utils";

interface DocItem {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number | null;
  chunkCount: number;
  createdAt: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "你好。上传简历、行业报告或求职资料后，我会基于你的资料回答问题，并尽量标明信息来源。",
    },
  ]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/knowledge/documents");
      const json = await res.json();
      if (json.success) setDocuments(json.data);
    } catch {
      // 忽略加载失败
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadDocuments();
    });
  }, [loadDocuments]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/knowledge/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        toast.success(`已上传: ${file.name}`);
        loadDocuments();
      } else {
        toast.error(json.error || "上传失败");
      }
    } catch {
      toast.error("上传失败，请检查网络");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/knowledge/documents/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("已删除");
        setDeleteTarget(null);
        loadDocuments();
      } else {
        toast.error(json.error || "删除失败");
      }
    } catch {
      toast.error("删除失败");
    }
  };

  const handleSend = async () => {
    const query = input.trim();
    if (!query || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: query };
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "" };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/knowledge/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsg.id ? { ...m, content: "抱歉，AI 回答失败，请重试。" } : m
          )
        );
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let content = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) content += delta;
          } catch {
            // 忽略解析失败的行
          }
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsg.id ? { ...m, content } : m))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsg.id ? { ...m, content: "抱歉，连接中断，请重试。" } : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editorial-shell px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-black/10 pb-6">
          <p className="editorial-label mb-3">Research Notes</p>
          <h1 className="font-editorial text-5xl leading-none tracking-tight text-black md:text-7xl">
            Knowledge Base
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
            Ask questions across your resume, reports and job materials. The interface is designed like a quiet research desk.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="editorial-card reveal-up rounded-[28px] p-5">
            <div className="mb-5 flex items-end justify-between border-b border-black/10 pb-4">
              <div>
                <p className="editorial-label">Document Archive</p>
                <h2 className="mt-2 text-xl font-medium text-black">资料库</h2>
              </div>
              <Badge variant="outline" className="rounded-full border-black/10 text-zinc-500">
                {documents.length} files
              </Badge>
            </div>

            <FileDropzone
              accept={ALL_EXTENSIONS}
              maxSize={5 * 1024 * 1024}
              onSelect={handleUpload}
              loading={uploading}
              label="上传求职资料"
              hint="PDF / DOCX / TXT · 最大 5MB"
              className="p-6"
            />

            <div className="mt-5 space-y-2">
              {documents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 p-5 text-center text-xs leading-6 text-zinc-500">
                  还没有上传任何文档。先放入简历或岗位资料，再开始提问。
                </div>
              ) : (
                documents.map((doc) => (
                  <FileCard
                    key={doc.id}
                    variant="compact"
                    file={{ name: doc.filename, size: doc.fileSize, type: doc.fileType.toUpperCase() }}
                    onRemove={() => setDeleteTarget(doc)}
                  />
                ))
              )}
            </div>
          </aside>

          <section className="editorial-card reveal-up reveal-delay-1 flex min-h-[680px] flex-col rounded-[28px]">
            <div className="border-b border-black/10 px-5 py-4 md:px-7">
              <p className="editorial-label">AI Conversation</p>
              <h2 className="mt-2 text-xl font-medium text-black">基于资料的求职问答</h2>
            </div>

            <ScrollArea className="flex-1 px-5 py-6 md:px-7">
              <div className="mx-auto max-w-3xl space-y-5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`grid gap-3 ${
                      msg.role === "user" ? "grid-cols-[1fr_auto]" : "grid-cols-[auto_1fr]"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <span className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-400">AI</span>
                    )}
                    <div
                      className={`rounded-3xl border px-5 py-4 text-sm leading-7 ${
                        msg.role === "user"
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-[#fafafa] text-zinc-800"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <p>{msg.content}</p>
                      ) : msg.content ? (
                        <div className="prose prose-sm max-w-none prose-p:leading-7 prose-headings:text-black prose-a:text-black">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                          {loading && (
                            <span className="inline-block h-4 w-2 bg-black align-text-bottom animate-blink-cursor" />
                          )}
                        </div>
                      ) : loading ? (
                        <BouncingDots />
                      ) : null}
                    </div>
                    {msg.role === "user" && (
                      <span className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-400">You</span>
                    )}
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="border-t border-black/10 p-4 md:p-5">
              <div className="mx-auto flex max-w-3xl gap-2 rounded-full border border-black/10 bg-white p-1.5">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={documents.length === 0 ? "先上传文档，再开始提问..." : "Ask a question from your materials..."}
                  disabled={loading}
                  className="h-10 flex-1 border-0 bg-transparent px-4 text-black placeholder:text-zinc-400 focus-visible:ring-0"
                  aria-label="输入问题"
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="h-10 w-10 rounded-full bg-black text-white hover:bg-zinc-800"
                  aria-label="发送消息"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="border-black/10 bg-white text-black" aria-describedby="delete-dialog-desc">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription id="delete-dialog-desc" className="text-zinc-500">
              确定要删除「{deleteTarget?.filename}」吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
