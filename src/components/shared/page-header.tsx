/**
 * PageHeader — 统一的页面标题组件
 */
interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {description && <p className="mt-1.5 text-sm text-zinc-400">{description}</p>}
    </header>
  );
}
