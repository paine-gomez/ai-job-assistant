/**
 * BouncingDots — AI 思考中的跳动三点动画
 *
 * 可访问性：aria-label="正在思考" + role="status" 让屏幕阅读器感知
 */
interface BouncingDotsProps {
  size?: "sm" | "md";
  color?: string;
}

const sizeMap = { sm: "w-1.5 h-1.5", md: "w-2 h-2" };

export function BouncingDots({ size = "md", color = "bg-black" }: BouncingDotsProps) {
  const dotSize = sizeMap[size];

  return (
    <div className="flex items-center gap-1 py-1" role="status" aria-label="正在思考">
      <span
        className={`${dotSize} rounded-full ${color} animate-bounce-dot`}
        style={{ animationDelay: "0s" }}
      />
      <span
        className={`${dotSize} rounded-full ${color} animate-bounce-dot`}
        style={{ animationDelay: "0.2s" }}
      />
      <span
        className={`${dotSize} rounded-full ${color} animate-bounce-dot`}
        style={{ animationDelay: "0.4s" }}
      />
      <span className="sr-only">AI 正在生成回复...</span>
    </div>
  );
}
