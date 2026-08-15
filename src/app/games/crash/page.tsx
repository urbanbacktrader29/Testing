"use client";

import { useEffect, useRef, useState } from "react";
import { fairFloat } from "@/lib/fairness";
import { crashPointFromFloat, growthRateForRound, multiplierAtElapsed } from "@/lib/crash";
import { useCasinoStore } from "@/lib/store";
import GameShell from "@/components/GameShell";
import BetAmountInput from "@/components/BetAmountInput";

type Phase = "idle" | "betting" | "running" | "crashed";
const BETTING_MS = 3000;
const CRASHED_HOLD_MS = 2500;

interface RoundRecord {
  id: string;
  crashPoint: number;
  cashedOutAt: number | null;
  win: boolean;
  payout: number;
}

export default function CrashPage() {
  const debit = useCasinoStore((s) => s.debit);
  const credit = useCasinoStore((s) => s.credit);
  const consumeNonce = useCasinoStore((s) => s.consumeNonce);
  const logTransaction = useCasinoStore((s) => s.logTransaction);

  const [betAmount, setBetAmount] = useState(10);
  const [phase, setPhase] = useState<Phase>("idle");
  const [multiplier, setMultiplier] = useState(1);
  const [countdown, setCountdown] = useState(0);
  const [hasBet, setHasBet] = useState(false);
  const [cashedOutAt, setCashedOutAt] = useState<number | null>(null);
  const [revealedCrash, setRevealedCrash] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rounds, setRounds] = useState<RoundRecord[]>([]);

  const crashPointRef = useRef(1);
  const growthRef = useRef(0.2);
  const roundBetRef = useRef(0);
  const cashedOutRef = useRef<number | null>(null);
  const roundMetaRef = useRef({ nonce: 0, serverSeedHash: "", clientSeed: "" });
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function placeBet() {
    setError(null);
    if (phase !== "idle") return;
    if (betAmount <= 0) {
      setError("Enter a bet amount greater than 0.");
      return;
    }
    if (!debit(betAmount)) {
      setError("Insufficient balance.");
      return;
    }

    roundBetRef.current = betAmount;
    setHasBet(true);
    setCashedOutAt(null);
    cashedOutRef.current = null;
    setRevealedCrash(null);

    const meta = consumeNonce();
    roundMetaRef.current = { nonce: meta.nonce, serverSeedHash: meta.serverSeedHash, clientSeed: meta.clientSeed };
    const f = await fairFloat(meta.serverSeed, meta.clientSeed, meta.nonce);
    crashPointRef.current = crashPointFromFloat(f);
    growthRef.current = growthRateForRound(crashPointRef.current);

    setPhase("betting");
    let remaining = BETTING_MS;
    setCountdown(remaining);
    const tick = () => {
      remaining -= 100;
      setCountdown(Math.max(0, remaining));
      if (remaining <= 0) {
        startRunning();
      } else {
        timeoutRef.current = setTimeout(tick, 100);
      }
    };
    timeoutRef.current = setTimeout(tick, 100);
  }

  function startRunning() {
    setPhase("running");
    setMultiplier(1);
    // eslint-disable-next-line react-hooks/purity -- animation clock read from an event-triggered callback, never during render
    startRef.current = performance.now();
    const loop = () => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      const m = multiplierAtElapsed(elapsed, growthRef.current);
      if (m >= crashPointRef.current) {
        setMultiplier(crashPointRef.current);
        finishRound();
        return;
      }
      setMultiplier(m);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }

  /** Cashing out settles the bet immediately — the crash point is already fixed, so the
   *  outcome is certain the moment the player clicks. The animation keeps running purely
   *  for suspense; it must never gate the payout. */
  function cashOut() {
    if (phase !== "running" || cashedOutRef.current !== null) return;
    cashedOutRef.current = multiplier;
    setCashedOutAt(multiplier);

    const payout = Math.round(roundBetRef.current * multiplier * 100) / 100;
    credit(payout);
    logTransaction({
      game: "crash",
      betAmount: roundBetRef.current,
      payout,
      multiplier,
      result: "win",
      ...roundMetaRef.current,
      detail: `Cashed out at ${multiplier.toFixed(2)}x (crash point revealed at round end)`,
    });
  }

  function finishRound() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase("crashed");
    setRevealedCrash(crashPointRef.current);

    const win = cashedOutRef.current !== null;
    if (!win) {
      logTransaction({
        game: "crash",
        betAmount: roundBetRef.current,
        payout: 0,
        multiplier: 0,
        result: "loss",
        ...roundMetaRef.current,
        detail: `Crashed at ${crashPointRef.current.toFixed(2)}x with no cash out`,
      });
    }

    setRounds((prev) =>
      [
        {
          id: `${roundMetaRef.current.nonce}-${Date.now()}`,
          crashPoint: crashPointRef.current,
          cashedOutAt: cashedOutRef.current,
          win,
          payout: win ? Math.round(roundBetRef.current * (cashedOutRef.current ?? 0) * 100) / 100 : 0,
        },
        ...prev,
      ].slice(0, 24)
    );

    timeoutRef.current = setTimeout(() => {
      setPhase("idle");
      setHasBet(false);
    }, CRASHED_HOLD_MS);
  }

  const isRunning = phase === "running";
  const displayMultiplier = phase === "crashed" ? revealedCrash ?? multiplier : multiplier;

  return (
    <GameShell
      title="Crash"
      subtitle="Place a bet, watch the multiplier climb, cash out before it crashes."
      controls={
        <div className="flex flex-col gap-4">
          <BetAmountInput value={betAmount} onChange={setBetAmount} disabled={phase !== "idle"} />

          {error && <p className="text-xs text-loss">{error}</p>}

          {phase === "running" && cashedOutAt === null ? (
            <button
              onClick={cashOut}
              className="rounded-lg bg-gold py-3 text-sm font-black text-black hover:opacity-90 transition-opacity"
            >
              Cash Out ({(betAmount * multiplier).toFixed(2)} FUN)
            </button>
          ) : (
            <button
              onClick={placeBet}
              disabled={phase !== "idle"}
              className="rounded-lg bg-gradient-to-r from-rose-600 to-orange-500 py-3 text-sm font-black text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {phase === "idle" ? "Place Bet" : phase === "betting" ? "Round starting…" : "Round in progress…"}
            </button>
          )}

          {hasBet && cashedOutAt !== null && (
            <p className="text-xs text-win font-semibold">
              Cashed out at {cashedOutAt.toFixed(2)}× — locked in.
            </p>
          )}

          <div>
            <p className="text-xs font-semibold text-muted mb-2">Recent crashes</p>
            <div className="flex flex-wrap gap-1.5">
              {rounds.map((r) => (
                <span
                  key={r.id}
                  className={`rounded-md px-2 py-1 text-xs font-bold ${
                    r.crashPoint >= 2 ? "bg-win/15 text-win" : "bg-loss/15 text-loss"
                  }`}
                >
                  {r.crashPoint.toFixed(2)}×
                </span>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-xl h-64 rounded-xl bg-surface-3 overflow-hidden flex items-center justify-center">
          <CrashCurve multiplier={displayMultiplier} phase={phase} />
          <div className="relative z-10 text-center">
            {phase === "betting" ? (
              <>
                <p className="text-sm text-muted mb-2">Next round in</p>
                <p className="text-4xl font-black tabular-nums">{(countdown / 1000).toFixed(1)}s</p>
              </>
            ) : (
              <p
                className={`text-6xl font-black tabular-nums ${
                  phase === "crashed" ? "text-loss" : isRunning ? "text-foreground" : "text-muted"
                }`}
              >
                {displayMultiplier.toFixed(2)}×
              </p>
            )}
            {phase === "crashed" && <p className="text-sm font-bold text-loss mt-2">CRASHED</p>}
          </div>
        </div>
      </div>
    </GameShell>
  );
}

function CrashCurve({ multiplier, phase }: { multiplier: number; phase: Phase }) {
  const progress = Math.min(1, Math.log(multiplier) / Math.log(20));
  const x = 10 + progress * 80;
  const y = 90 - progress * 80;
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path
        d={`M 10 90 Q ${x} ${y + 15}, ${x} ${y}`}
        fill="none"
        stroke={phase === "crashed" ? "var(--loss)" : "var(--accent-2)"}
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
