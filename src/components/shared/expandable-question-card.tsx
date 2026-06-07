/**
 * ExpandableQuestionCard — 可展开的面试题卡片
 *
 * 使用原生 <details>/<summary> 实现，天然键盘可访问、屏幕阅读器友好。
 * 折叠态显示编号和题目，展开后显示考察意图和回答思路。
 */
"use client";

import { ChevronRight } from "lucide-react";
import type { InterviewQuestion } from "@/types";

const CATEGORY_LABELS: Record<InterviewQuestion["category"], string> = {
  resume: "简历深挖",
  competency: "岗位胜任",
  behavioral: "行为情景",
};

interface ExpandableQuestionCardProps {
  question: InterviewQuestion;
  index: number;
  defaultExpanded?: boolean;
}

export function ExpandableQuestionCard({
  question,
  index,
  defaultExpanded = false,
}: ExpandableQuestionCardProps) {
  return (
    <details
      className="group rounded-2xl border border-black/10 bg-white transition-colors hover:border-black/20 open:bg-[#fafafa]"
      open={defaultExpanded}
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 select-none">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/15 bg-white text-xs tabular-nums text-zinc-500 group-open:bg-black group-open:text-white group-open:border-black transition-colors">
          {String(index).padStart(2, "0")}
        </span>
        <span className="flex-1 text-sm leading-6 text-black">
          {question.question}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-90" />
      </summary>

      <div className="mx-5 mb-5 ml-[3.25rem] space-y-4 border-t border-black/5 pt-4">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.1em] text-zinc-400">
            考察意图
          </p>
          <p className="text-sm leading-6 text-zinc-600">{question.intent}</p>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.1em] text-zinc-400">
            回答思路
          </p>
          <p className="text-sm leading-6 text-zinc-600">{question.approach}</p>
        </div>
      </div>
    </details>
  );
}
