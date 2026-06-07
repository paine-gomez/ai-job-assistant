/**
 * LoadingButton — 带加载态的按钮
 *
 * 特性：
 * - loading 时自动禁用 + 显示 spinner
 * - aria-busy 通知屏幕阅读器
 * - 透传所有原生 Button props
 */
import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2, type LucideIcon } from "lucide-react";

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
  loadingText?: string;
  icon?: LucideIcon;
}

export function LoadingButton({
  loading,
  loadingText,
  icon: Icon,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4 mr-2" />
      ) : null}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
}
