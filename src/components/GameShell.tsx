import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GameShell({
  title,
  subtitle,
  controls,
  children,
}: {
  title: string;
  subtitle: string;
  controls: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to lobby
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-black">{title}</h1>
        <p className="text-sm text-muted mt-1">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
        <div className="rounded-2xl border border-border bg-surface p-5 h-fit lg:sticky lg:top-20">
          {controls}
        </div>
        <div className="rounded-2xl border border-border bg-surface-2 p-5 min-h-[420px] flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
