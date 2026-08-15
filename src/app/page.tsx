import Link from "next/link";
import { ShieldCheck, Sparkles, Zap } from "lucide-react";
import { GAMES } from "@/lib/games";
import GameCard from "@/components/GameCard";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-surface to-surface-2 p-8 sm:p-12">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent opacity-20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-accent-2 opacity-10 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            100% free play-money
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight">
            Provably-fair originals.
            <br />
            Zero real money, all the thrill.
          </h1>
          <p className="mt-4 text-muted text-base sm:text-lg leading-relaxed">
            FortunaPlay is a free demo casino for practicing and having fun with classic
            probability games. Every round starts with 1,000 FUN credits and every outcome can be
            independently verified with our provably-fair engine.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/games/dice"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
            >
              Start playing
            </Link>
            <Link
              href="/fairness"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-bold hover:border-accent transition-colors"
            >
              How fairness works
            </Link>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Provably fair"
            desc="HMAC-SHA256 seeds you can verify after every round."
          />
          <Feature
            icon={<Sparkles className="h-5 w-5" />}
            title="No real money"
            desc="Play credits only — nothing to deposit, buy, or withdraw."
          />
          <Feature
            icon={<Zap className="h-5 w-5" />}
            title="Instant reset"
            desc="Balance running low? Top back up any time from your wallet."
          />
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Originals</h2>
          <span className="text-sm text-muted">{GAMES.length} games</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-accent">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-muted mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
