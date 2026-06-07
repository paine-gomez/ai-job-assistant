/**
 * PageHeader — 统一的页面标题组件
 */
interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8 border-b border-black/10 pb-6">
      <p className="editorial-label mb-3">AI Job Assistant</p>
      <h1 className="font-editorial text-5xl leading-none tracking-tight text-black md:text-7xl">
        {title}
      </h1>
      {description && <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">{description}</p>}
    </header>
  );
}
