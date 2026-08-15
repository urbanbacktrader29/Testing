"use client";

import { useState } from "react";
import { Bomb, Gem } from "lucide-react";
import { fairShuffledIndices } from "@/lib/fairness";
import { useCasinoStore } from "@/lib/store";
import { GRID_SIZE, maxGems, minesMultiplier } from "@/lib/mines";
import GameShell from "@/components/GameShell";
import BetAmountInput from "@/components/BetAmountInput";

type TileState = "hidden" | "gem" | "mine";

export default function MinesPage() {
  const debit = useCasinoStore((s) => s.debit);
  const credit = useCasinoStore((s) => s.credit);
  const consumeNonce = useCasinoStore((s) => s.consumeNonce);
  const logTransaction = useCasinoStore((s) => s.logTransaction);

  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(5);
  const [minePositions, setMinePositions] = useState<Set<number> | null>(null);
  const [tiles, setTiles] = useState<TileState[]>(Array(GRID_SIZE).fill("hidden"));
  const [gemsFound, setGemsFound] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [roundBet, setRoundBet] = useState(0);
  const [roundMeta, setRoundMeta] = useState({ nonce: 0, serverSeedHash: "", clientSeed: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const currentMultiplier = minesMultiplier(mineCount, gemsFound);
  const nextMultiplier = minesMultiplier(mineCount, gemsFound + 1);

  async function startRound() {
    setError(null);
    setMessage(null);
    if (betAmount <= 0) {
      setError("Enter a bet amount greater than 0.");
      return;
    }
    if (!debit(betAmount)) {
      setError("Insufficient balance.");
      return;
    }
    setBusy(true);
    const { nonce, serverSeed, clientSeed, serverSeedHash } = consumeNonce();
    const shuffled = await fairShuffledIndices(serverSeed, clientSeed, nonce, GRID_SIZE);
    const mines = new Set(shuffled.slice(0, mineCount));

    setMinePositions(mines);
    setTiles(Array(GRID_SIZE).fill("hidden"));
    setGemsFound(0);
    setRoundActive(true);
    setRoundBet(betAmount);
    setRoundMeta({ nonce, serverSeedHash, clientSeed });
    setBusy(false);
  }

  function revealAll(mines: Set<number>, hitIndex: number | null) {
    setTiles((prev) =>
      prev.map((t, i) => {
        if (mines.has(i)) return "mine";
        if (i === hitIndex) return "mine";
        return t === "gem" ? "gem" : "hidden";
      })
    );
  }

  function handleTileClick(index: number) {
    if (!roundActive || !minePositions || tiles[index] !== "hidden" || busy) return;

    if (minePositions.has(index)) {
      const newTiles = [...tiles];
      newTiles[index] = "mine";
      setTiles(newTiles.map((t, i) => (minePositions.has(i) ? "mine" : t)));
      setRoundActive(false);
      setMessage(`Boom — hit a mine. Lost ${roundBet.toFixed(2)} FUN.`);
      logTransaction({
        game: "mines",
        betAmount: roundBet,
        payout: 0,
        multiplier: 0,
        result: "loss",
        nonce: roundMeta.nonce,
        serverSeedHash: roundMeta.serverSeedHash,
        clientSeed: roundMeta.clientSeed,
        detail: `Hit mine after ${gemsFound} safe tiles (${mineCount} mines)`,
      });
      return;
    }

    const newGems = gemsFound + 1;
    const newTiles = [...tiles];
    newTiles[index] = "gem";
    setTiles(newTiles);
    setGemsFound(newGems);

    if (newGems >= maxGems(mineCount)) {
      const payout = Math.round(roundBet * minesMultiplier(mineCount, newGems) * 100) / 100;
      credit(payout);
      setRoundActive(false);
      setMessage(`All safe tiles cleared! Won ${payout.toFixed(2)} FUN.`);
      revealAll(minePositions, null);
      logTransaction({
        game: "mines",
        betAmount: roundBet,
        payout,
        multiplier: minesMultiplier(mineCount, newGems),
        result: "win",
        nonce: roundMeta.nonce,
        serverSeedHash: roundMeta.serverSeedHash,
        clientSeed: roundMeta.clientSeed,
        detail: `Cleared board with ${mineCount} mines`,
      });
    }
  }

  function cashOut() {
    if (!roundActive || gemsFound === 0 || !minePositions) return;
    const payout = Math.round(roundBet * currentMultiplier * 100) / 100;
    credit(payout);
    setRoundActive(false);
    setMessage(`Cashed out ${payout.toFixed(2)} FUN at ${currentMultiplier.toFixed(2)}×.`);
    revealAll(minePositions, null);
    logTransaction({
      game: "mines",
      betAmount: roundBet,
      payout,
      multiplier: currentMultiplier,
      result: "win",
      nonce: roundMeta.nonce,
      serverSeedHash: roundMeta.serverSeedHash,
      clientSeed: roundMeta.clientSeed,
      detail: `Cashed out after ${gemsFound} safe tiles (${mineCount} mines)`,
    });
  }

  return (
    <GameShell
      title="Mines"
      subtitle="Reveal gems, avoid the mines, cash out whenever you like."
      controls={
        <div className="flex flex-col gap-4">
          <BetAmountInput value={betAmount} onChange={setBetAmount} disabled={roundActive || busy} />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-muted">Mines</label>
              <span className="text-xs font-semibold">{mineCount}</span>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              step={1}
              value={mineCount}
              disabled={roundActive || busy}
              onChange={(e) => setMineCount(parseInt(e.target.value, 10))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg bg-surface-2 p-3 text-xs">
            <div>
              <p className="text-muted">Current multiplier</p>
              <p className="font-bold text-sm">{currentMultiplier.toFixed(4)}×</p>
            </div>
            <div>
              <p className="text-muted">Next tile multiplier</p>
              <p className="font-bold text-sm text-accent">{nextMultiplier.toFixed(4)}×</p>
            </div>
          </div>

          {error && <p className="text-xs text-loss">{error}</p>}
          {message && <p className="text-xs text-muted">{message}</p>}

          {!roundActive ? (
            <button
              onClick={startRound}
              disabled={busy}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-black text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {busy ? "Starting…" : "Start Round"}
            </button>
          ) : (
            <button
              onClick={cashOut}
              disabled={gemsFound === 0}
              className="rounded-lg bg-gold py-3 text-sm font-black text-black hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              Cash Out {gemsFound > 0 ? `(${(roundBet * currentMultiplier).toFixed(2)} FUN)` : ""}
            </button>
          )}
        </div>
      }
    >
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-md">
          {tiles.map((t, i) => (
            <button
              key={i}
              onClick={() => handleTileClick(i)}
              disabled={!roundActive || t !== "hidden"}
              className={`aspect-square rounded-xl border flex items-center justify-center transition-all ${
                t === "hidden"
                  ? "border-border bg-surface-3 hover:border-accent hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:border-border"
                  : t === "gem"
                    ? "border-win/40 bg-win/15 animate-pop-in"
                    : "border-loss/40 bg-loss/15 animate-pop-in"
              }`}
            >
              {t === "gem" && <Gem className="h-6 w-6 text-win" />}
              {t === "mine" && <Bomb className="h-6 w-6 text-loss" />}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
