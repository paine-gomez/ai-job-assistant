"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import { Upload, Trash2, Send, Loader2, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

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

  // 加载文档列表
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

  // 自动滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 上传文件
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "doc", "txt"].includes(ext || "")) {
      toast.error("仅支持 PDF、DOCX、TXT 格式");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("文件大小不能超过 5MB");
      return;
    }

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

  // 删除文档
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

  // 发送消息
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
            m.id === aiMsg.id
              ? { ...m, content: "抱歉，AI 回答失败，请重试。" }
              : m
          )
        );
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        try {
          const lines = chunk.split("\n").filter((l) => l.startsWith("0:"));
          for (const line of lines) {
            const text = JSON.parse(line.slice(2));
            if (text) content += text;
          }
        } catch {
          content += chunk;
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsg.id ? { ...m, content } : m))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsg.id
            ? { ...m, content: "抱歉，连接中断，请重试。" }
            : m
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

        {/* 上传按钮 */}
        <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-700 p-6 text-center cursor-pointer hover:border-indigo-500/50 transition-colors">
          {uploading ? (
            <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
          ) : (
            <Upload className="h-6 w-6 text-zinc-500" />
          )}
          <span className="text-xs text-zinc-500">
            {uploading ? "上传中..." : "点击上传文件"}
          </span>
          <span className="text-xs text-zinc-600">PDF / DOCX / TXT</span>
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>

        {/* 文档列表 */}
        {documents.length === 0 && (
          <p className="text-xs text-zinc-600 text-center py-4">
            还没有上传任何文档
          </p>
        )}
        <div className="flex flex-col gap-2 overflow-auto">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 p-2 group"
            >
              <FileText className="h-4 w-4 text-zinc-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 truncate">{doc.filename}</p>
                <p className="text-xs text-zinc-600">
                  {doc.fileType.toUpperCase()} · {(doc.fileSize ?? 0) / 1024 > 100
                    ? `${Math.round((doc.fileSize ?? 0) / 1024 / 1024)}MB`
                    : `${Math.round((doc.fileSize ?? 0) / 1024)}KB`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400"
                onClick={() => setDeleteTarget(doc)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
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
                  ) : (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{msg.content || (loading ? "思考中..." : "")}</ReactMarkdown>
                    </div>
                  )}
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
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="bg-indigo-600 hover:bg-indigo-500"
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
        <DialogContent className="border-zinc-800 bg-zinc-950 text-white">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription className="text-zinc-400">
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
