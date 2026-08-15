import Link from "next/link";
import { Bomb, CircleDot, Dice5, TrendingUp } from "lucide-react";
import type { GameMeta } from "@/lib/games";

const ICONS = {
  dice: Dice5,
  mines: Bomb,
  crash: TrendingUp,
  plinko: CircleDot,
};

export default function GameCard({ game }: { game: GameMeta }) {
  const Icon = ICONS[game.id];
  return (
    <Link
      href={game.href}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent hover:-translate-y-1"
    >
      <div
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${game.gradient} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`}
      />
      <div
        className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${game.gradient} shadow-lg`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="relative mt-4 text-lg font-bold">{game.name}</h3>
      <p className="relative mt-1 text-sm text-muted leading-relaxed">{game.tagline}</p>
      <span className="relative mt-4 inline-block text-sm font-semibold text-accent">
        Play now →
      </span>
    </Link>
  );
}
