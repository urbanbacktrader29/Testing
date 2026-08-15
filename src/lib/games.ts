import type { GameId } from "./types";

export interface GameMeta {
  id: GameId;
  name: string;
  tagline: string;
  href: string;
  gradient: string;
}

export const GAMES: GameMeta[] = [
  {
    id: "dice",
    name: "Dice",
    tagline: "Pick a target, roll under or over, provably fair.",
    href: "/games/dice",
    gradient: "from-violet-600 to-fuchsia-500",
  },
  {
    id: "mines",
    name: "Mines",
    tagline: "Clear a 5x5 grid, avoid the mines, cash out anytime.",
    href: "/games/mines",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: "crash",
    name: "Crash",
    tagline: "Cash out before the multiplier crashes.",
    href: "/games/crash",
    gradient: "from-rose-600 to-orange-500",
  },
  {
    id: "plinko",
    name: "Plinko",
    tagline: "Drop the ball, ride the pegs, land a multiplier.",
    href: "/games/plinko",
    gradient: "from-emerald-500 to-teal-500",
  },
];
