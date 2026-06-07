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
import { DOCUMENT_ACCEPT, ALL_EXTENSIONS } from "@/lib/file-utils";

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
      content: "👋 你好！上传求职相关资料后，就可以向我提问了。我会基于你上传的资料来回答。",
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
    loadDocuments();
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
    <div className="flex h-[calc(100vh-3.5rem)] max-w-5xl mx-auto">
      {/* 左侧栏 - 文档管理 */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 p-4 gap-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          知识库文档
        </h2>

        <FileDropzone
          accept={ALL_EXTENSIONS}
          maxSize={5 * 1024 * 1024}
          onSelect={handleUpload}
          loading={uploading}
          label="点击上传文件"
          hint="PDF / DOCX / TXT"
          className="p-6"
        />

        {documents.length === 0 && (
          <p className="text-xs text-zinc-600 text-center py-4">
            还没有上传任何文档
          </p>
        )}
        <div className="flex flex-col gap-2 overflow-auto">
          {documents.map((doc) => (
            <FileCard
              key={doc.id}
              variant="compact"
              file={{ name: doc.filename, size: doc.fileSize, type: doc.fileType.toUpperCase() }}
              onRemove={() => setDeleteTarget(doc)}
            />
          ))}
        </div>

        <Badge variant="outline" className="text-xs text-zinc-600 border-zinc-800 self-start">
          共 {documents.length} 份文档
        </Badge>
      </aside>

      {/* 右侧 - 对话区 */}
      <div className="flex flex-1 flex-col min-w-0">
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-900 text-zinc-200"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p>{msg.content}</p>
                  ) : msg.content ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                      {loading && (
                        <span className="inline-block w-2 h-4 ml-0.5 bg-indigo-400 animate-blink-cursor align-text-bottom" />
                      )}
                    </div>
                  ) : loading ? (
                    <BouncingDots />
                  ) : null}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* 输入框 */}
        <div className="border-t border-white/10 p-4">
          <div className="flex max-w-2xl mx-auto gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={documents.length === 0 ? "请先上传文档..." : "输入问题..."}
              disabled={loading}
              className="flex-1 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
              aria-label="输入问题"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="bg-indigo-600 hover:bg-indigo-500"
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
      </div>

      {/* 删除确认弹窗 */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-white" aria-describedby="delete-dialog-desc">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription id="delete-dialog-desc" className="text-zinc-400">
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
