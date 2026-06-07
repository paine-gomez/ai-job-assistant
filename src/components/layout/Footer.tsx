export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white py-8 text-xs text-zinc-500">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
        <p>AI Job Assistant © {new Date().getFullYear()}</p>
        <p>曹嘉明 · AI Product Manager Portfolio</p>
      </div>
    </footer>
  );
}
