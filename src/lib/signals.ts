import { prisma } from "@/lib/prisma";

type SignalDirection = "BUY" | "SELL";

type Instrument = {
  symbol: string;
  basePrice: number;
  volatilityPct: number;
  decimals: number;
};

const INSTRUMENTS: Instrument[] = [
  { symbol: "BTC/USD", basePrice: 64200, volatilityPct: 1.4, decimals: 0 },
  { symbol: "ETH/USD", basePrice: 3150, volatilityPct: 1.8, decimals: 1 },
  { symbol: "EUR/USD", basePrice: 1.086, volatilityPct: 0.3, decimals: 4 },
  { symbol: "GBP/USD", basePrice: 1.271, volatilityPct: 0.35, decimals: 4 },
  { symbol: "XAU/USD", basePrice: 2415, volatilityPct: 0.6, decimals: 2 },
  { symbol: "US500", basePrice: 5460, volatilityPct: 0.5, decimals: 1 },
  { symbol: "NAS100", basePrice: 19100, volatilityPct: 0.7, decimals: 1 },
  { symbol: "SOL/USD", basePrice: 148, volatilityPct: 2.5, decimals: 2 },
];

const TIMEFRAMES = ["5m", "15m", "1h", "4h"];

const NOTES = [
  "Momentum breakout confirmed above key resistance with rising volume.",
  "Trend continuation setup off the daily EMA cluster.",
  "Liquidity sweep followed by a clean reversal structure.",
  "Range compression resolving in the direction of the higher timeframe trend.",
  "Order block retest with strong confluence on the 4h.",
  "Divergence signal on momentum oscillator at a key level.",
];

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function generateRandomSignal() {
  const instrument = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
  const direction: SignalDirection = Math.random() > 0.5 ? "BUY" : "SELL";

  const drift = (Math.random() - 0.5) * 2 * (instrument.volatilityPct / 100);
  const entry = instrument.basePrice * (1 + drift);

  const riskPct = (0.4 + Math.random() * 0.8) / 100;
  const rewardMultiple = 1.5 + Math.random() * 1.5;

  const stopLoss =
    direction === "BUY" ? entry * (1 - riskPct) : entry * (1 + riskPct);
  const takeProfit =
    direction === "BUY"
      ? entry * (1 + riskPct * rewardMultiple)
      : entry * (1 - riskPct * rewardMultiple);

  return {
    symbol: instrument.symbol,
    direction,
    entry: round(entry, instrument.decimals),
    stopLoss: round(stopLoss, instrument.decimals),
    takeProfit: round(takeProfit, instrument.decimals),
    confidence: Math.floor(62 + Math.random() * 33),
    timeframe: TIMEFRAMES[Math.floor(Math.random() * TIMEFRAMES.length)],
    note: NOTES[Math.floor(Math.random() * NOTES.length)],
  };
}

export async function createRandomSignal() {
  const data = generateRandomSignal();
  return prisma.signal.create({ data });
}

export async function getRecentSignals(limit = 30) {
  return prisma.signal.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Ensures there's always some seed data so the dashboard never looks empty. */
export async function ensureSeedSignals() {
  const count = await prisma.signal.count();
  if (count === 0) {
    const seeds = Array.from({ length: 12 }, () => generateRandomSignal());
    await prisma.signal.createMany({ data: seeds });
  }
}
