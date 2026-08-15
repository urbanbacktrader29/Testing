"use client";

import { useState } from "react";
import { fairFloat } from "@/lib/fairness";
import { useCasinoStore } from "@/lib/store";
import GameShell from "@/components/GameShell";
import BetAmountInput from "@/components/BetAmountInput";

const HOUSE_EDGE = 0.01;

interface RollRecord {
  id: string;
  roll: number;
  target: number;
  direction: "under" | "over";
  win: boolean;
  payout: number;
  multiplier: number;
}

export default function DicePage() {
  const debit = useCasinoStore((s) => s.debit);
  const credit = useCasinoStore((s) => s.credit);
  const consumeNonce = useCasinoStore((s) => s.consumeNonce);
  const logTransaction = useCasinoStore((s) => s.logTransaction);

  const [betAmount, setBetAmount] = useState(10);
  const [winChance, setWinChance] = useState(50);
  const [direction, setDirection] = useState<"under" | "over">("under");
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rolls, setRolls] = useState<RollRecord[]>([]);

  const clampedChance = Math.min(95, Math.max(2, winChance));
  const multiplier = (100 / clampedChance) * (1 - HOUSE_EDGE);
  const target = direction === "under" ? clampedChance : 100 - clampedChance;
  const profitOnWin = betAmount * multiplier - betAmount;

  async function handleRoll() {
    setError(null);
    if (betAmount <= 0) {
      setError("Enter a bet amount greater than 0.");
      return;
    }
    if (!debit(betAmount)) {
      setError("Insufficient balance.");
      return;
    }

    setRolling(true);
    const { nonce, serverSeed, clientSeed, serverSeedHash } = consumeNonce();
    const float = await fairFloat(serverSeed, clientSeed, nonce);
    const roll = Math.round(float * 10000) / 100; // 0.00 - 99.99

    const win = direction === "under" ? roll < target : roll > target;
    const payout = win ? Math.round(betAmount * multiplier * 100) / 100 : 0;
    if (win) credit(payout);

    logTransaction({
      game: "dice",
      betAmount,
      payout,
      multiplier: win ? multiplier : 0,
      result: win ? "win" : "loss",
      nonce,
      serverSeedHash,
      clientSeed,
      detail: `Rolled ${roll.toFixed(2)}, target ${direction} ${target.toFixed(2)}`,
    });

    setRolls((prev) => [
      { id: `${nonce}-${Date.now()}`, roll, target, direction, win, payout, multiplier },
      ...prev,
    ].slice(0, 24));
    setRolling(false);
  }

  return (
    <GameShell
      title="Dice"
      subtitle="Pick your win chance and roll direction. Every roll is provably fair."
      controls={
        <div className="flex flex-col gap-4">
          <BetAmountInput value={betAmount} onChange={setBetAmount} disabled={rolling} />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-muted">Win chance</label>
              <span className="text-xs font-semibold">{clampedChance.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min={2}
              max={95}
              step={1}
              value={clampedChance}
              disabled={rolling}
              onChange={(e) => setWinChance(parseFloat(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDirection("under")}
              disabled={rolling}
              className={`rounded-lg border py-2 text-sm font-bold transition-colors ${
                direction === "under"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              Roll Under
            </button>
            <button
              onClick={() => setDirection("over")}
              disabled={rolling}
              className={`rounded-lg border py-2 text-sm font-bold transition-colors ${
                direction === "over"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              Roll Over
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg bg-surface-2 p-3 text-xs">
            <div>
              <p className="text-muted">Multiplier</p>
              <p className="font-bold text-sm">{multiplier.toFixed(4)}×</p>
            </div>
            <div>
              <p className="text-muted">Profit on win</p>
              <p className="font-bold text-sm text-win">
                +{profitOnWin.toFixed(2)}
              </p>
            </div>
          </div>

          {error && <p className="text-xs text-loss">{error}</p>}

          <button
            onClick={handleRoll}
            disabled={rolling}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 py-3 text-sm font-black text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {rolling ? "Rolling…" : "Roll Dice"}
          </button>
        </div>
      }
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <DiceTrack target={target} direction={direction} lastRoll={rolls[0]} />

        <div className="w-full max-w-xl">
          <p className="text-xs font-semibold text-muted mb-2">Recent rolls</p>
          <div className="flex flex-wrap gap-2">
            {rolls.length === 0 && (
              <p className="text-xs text-muted">No rolls yet — place a bet to get started.</p>
            )}
            {rolls.map((r) => (
              <span
                key={r.id}
                className={`rounded-md px-2.5 py-1 text-xs font-bold animate-pop-in ${
                  r.win ? "bg-win/15 text-win" : "bg-loss/15 text-loss"
                }`}
              >
                {r.roll.toFixed(2)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </GameShell>
  );
}

function DiceTrack({
  target,
  direction,
  lastRoll,
}: {
  target: number;
  direction: "under" | "over";
  lastRoll?: RollRecord;
}) {
  const winZoneStart = direction === "under" ? 0 : target;
  const winZoneWidth = direction === "under" ? target : 100 - target;

  return (
    <div className="w-full max-w-xl">
      <div className="relative h-10 rounded-full bg-surface-3 overflow-hidden">
        <div
          className="absolute inset-y-0 bg-win/25"
          style={{ left: `${winZoneStart}%`, width: `${winZoneWidth}%` }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-foreground/70"
          style={{ left: `${target}%` }}
        />
        {lastRoll && (
          <div
            key={lastRoll.id}
            className="absolute -top-1.5 h-13 w-1.5 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_12px_var(--gold)] animate-rise"
            style={{ left: `${lastRoll.roll}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-muted mt-2">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
      <div className="mt-6 text-center">
        {lastRoll ? (
          <>
            <p
              className={`text-5xl font-black tabular-nums ${
                lastRoll.win ? "text-win" : "text-loss"
              }`}
            >
              {lastRoll.roll.toFixed(2)}
            </p>
            <p className="text-sm font-semibold mt-1 text-muted">
              {lastRoll.win ? `Won ${lastRoll.payout.toFixed(2)} FUN` : "No win"}
            </p>
          </>
        ) : (
          <p className="text-5xl font-black text-muted tabular-nums">--.--</p>
        )}
      </div>
    </div>
  );
}
