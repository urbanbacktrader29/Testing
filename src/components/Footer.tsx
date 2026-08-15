import Link from "next/link";
import { Dices } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Dices className="h-4 w-4 text-accent" />
            FortunaPlay
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/fairness" className="hover:text-foreground">
              Provably fair
            </Link>
            <Link href="/wallet" className="hover:text-foreground">
              Wallet
            </Link>
          </div>
        </div>
        <p className="mt-4 max-w-3xl leading-relaxed">
          FortunaPlay is a free-to-play demo built for entertainment and educational purposes
          only. All balances are simulated play money (&quot;FUN&quot;) with no real-world value,
          cannot be purchased, withdrawn, or exchanged, and nothing here constitutes real-money
          gambling. If gambling stops being fun, resources are available at{" "}
          <span className="text-foreground">begambleaware.org</span>.
        </p>
      </div>
    </footer>
  );
}
