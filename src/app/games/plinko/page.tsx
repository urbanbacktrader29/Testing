"use client";

import { useMemo, useRef, useState } from "react";
import { fairFloats } from "@/lib/fairness";
import { buildMultiplierTable, bucketColor, type Risk } from "@/lib/plinko";
import { useCasinoStore } from "@/lib/store";
import GameShell from "@/components/GameShell";
import BetAmountInput from "@/components/BetAmountInput";

const ROW_OPTIONS = [8, 12, 16] as const;
const STEP_MS = 130;

interface DropRecord {
  id: string;
  bucket: number;
  multiplier: number;
  payout: number;
}

export default function PlinkoPage() {
  const debit = useCasinoStore((s) => s.debit);
  const credit = useCasinoStore((s) => s.credit);
  const consumeNonce = useCasinoStore((s) => s.consumeNonce);
  const logTransaction = useCasinoStore((s) => s.logTransaction);

  const [betAmount, setBetAmount] = useState(10);
  const [rows, setRows] = useState<number>(12);
  const [risk, setRisk] = useState<Risk>("medium");
  const [dropping, setDropping] = useState(false);
  const [ballPos, setBallPos] = useState<{ x: number; y: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drops, setDrops] = useState<DropRecord[]>([]);
  const [landedBucket, setLandedBucket] = useState<number | null>(null);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const table = useMemo(() => buildMultiplierTable(rows, risk), [rows, risk]);

  async function drop() {
    setError(null);
    if (dropping) return;
    if (betAmount <= 0) {
      setError("Enter a bet amount greater than 0.");
      return;
    }
    if (!debit(betAmount)) {
      setError("Insufficient balance.");
      return;
    }

    setDropping(true);
    setLandedBucket(null);
    const { nonce, serverSeed, clientSeed, serverSeedHash } = consumeNonce();
    const floats = await fairFloats(serverSeed, clientSeed, nonce, rows);
    const path = floats.map((f) => (f < 0.5 ? 0 : 1));
    const bucket = path.reduce((a: number, b) => a + b, 0);

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    let x = 50;
    setBallPos({ x, y: 0 });
    path.forEach((choice, i) => {
      const t = setTimeout(() => {
        x += (choice * 2 - 1) * (50 / rows);
        x = Math.max(4, Math.min(96, x));
        const y = ((i + 1) / (rows + 1)) * 100;
        setBallPos({ x, y });
        if (i === path.length - 1) {
          const multiplier = table[bucket];
          const payout = Math.round(betAmount * multiplier * 100) / 100;
          credit(payout);
          setLandedBucket(bucket);
          setDropping(false);
          logTransaction({
            game: "plinko",
            betAmount,
            payout,
            multiplier,
            result: payout >= betAmount ? "win" : "loss",
            nonce,
            serverSeedHash,
            clientSeed,
            detail: `${rows} rows, ${risk} risk, bucket ${bucket}`,
          });
          setDrops((prev) =>
            [{ id: `${nonce}-${Date.now()}`, bucket, multiplier, payout }, ...prev].slice(0, 24)
          );
        }
      }, (i + 1) * STEP_MS);
      timeoutsRef.current.push(t);
    });
  }

  return (
    <GameShell
      title="Plinko"
      subtitle="Drop the ball and let provably-fair pegs decide your multiplier."
      controls={
        <div className="flex flex-col gap-4">
          <BetAmountInput value={betAmount} onChange={setBetAmount} disabled={dropping} />

          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">Rows</label>
            <div className="grid grid-cols-3 gap-2">
              {ROW_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRows(r)}
                  disabled={dropping}
                  className={`rounded-lg border py-2 text-sm font-bold transition-colors ${
                    rows === r
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">Risk</label>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as Risk[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRisk(r)}
                  disabled={dropping}
                  className={`rounded-lg border py-2 text-xs font-bold capitalize transition-colors ${
                    risk === r
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-loss">{error}</p>}

          <button
            onClick={drop}
            disabled={dropping}
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-black text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {dropping ? "Dropping…" : "Drop Ball"}
          </button>

          <div>
            <p className="text-xs font-semibold text-muted mb-2">Recent drops</p>
            <div className="flex flex-wrap gap-1.5">
              {drops.map((d) => (
                <span
                  key={d.id}
                  className={`rounded-md px-2 py-1 text-xs font-bold ${
                    d.multiplier >= 1 ? "bg-win/15 text-win" : "bg-loss/15 text-loss"
                  }`}
                >
                  {d.multiplier.toFixed(2)}×
                </span>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="flex-1 flex flex-col">
        <div className="relative flex-1 min-h-[320px] rounded-xl bg-surface-3 overflow-hidden">
          <PegBoard rows={rows} />
          {ballPos && (
            <div
              className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_10px_var(--gold)] transition-all ease-linear"
              style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%`, transitionDuration: `${STEP_MS}ms` }}
            />
          )}
        </div>
        <div className="mt-3 grid gap-1" style={{ gridTemplateColumns: `repeat(${rows + 1}, minmax(0, 1fr))` }}>
          {table.map((m, k) => (
            <div
              key={k}
              className={`rounded py-1.5 text-center text-[10px] sm:text-xs font-bold text-black ${bucketColor(rows, k)} ${
                landedBucket === k ? "ring-2 ring-white animate-pop-in" : ""
              }`}
            >
              {m.toFixed(1)}
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

function PegBoard({ rows }: { rows: number }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-evenly py-4">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-4 sm:gap-5">
          {Array.from({ length: rowIndex + 2 }, (_, pegIndex) => (
            <span key={pegIndex} className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
          ))}
        </div>
      ))}
    </div>
  );
}
