export type GameId = "dice" | "mines" | "crash" | "plinko";

export type BetResult = "win" | "loss";

export interface Transaction {
  id: string;
  timestamp: number;
  game: GameId;
  betAmount: number;
  payout: number;
  multiplier: number;
  result: BetResult;
  nonce: number;
  serverSeedHash: string;
  clientSeed: string;
  detail?: string;
}

export interface RevealedSeed {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  finalNonce: number;
  revealedAt: number;
}
