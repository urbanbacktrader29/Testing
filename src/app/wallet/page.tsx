"use client";

import { Coins, RotateCcw, Trash2 } from "lucide-react";
import { useCasinoStore, gameLabel } from "@/lib/store";

const TOP_UPS = [100, 500, 1000];

export default function WalletPage() {
  const balance = useCasinoStore((s) => s.balance);
  const history = useCasinoStore((s) => s.history);
  const hasHydrated = useCasinoStore((s) => s.hasHydrated);
  const addFunds = useCasinoStore((s) => s.addFunds);
  const resetBalance = useCasinoStore((s) => s.resetBalance);

  const wins = history.filter((h) => h.result === "win").length;
  const losses = history.filter((h) => h.result === "loss").length;
  const netProfit = history.reduce((sum, h) => sum + h.payout - h.betAmount, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-black mb-1">Wallet</h1>
      <p className="text-sm text-muted mb-6">
        Simulated play-money balance. Nothing here has real-world value.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-semibold">
            <Coins className="h-4 w-4 text-gold" />
            Balance
          </div>
          <p className="mt-2 text-3xl font-black tabular-nums" suppressHydrationWarning>
            {hasHydrated ? balance.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
            <span className="text-sm text-muted ml-1">FUN</span>
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-semibold text-muted">Net profit</p>
          <p
            className={`mt-2 text-3xl font-black tabular-nums ${netProfit >= 0 ? "text-win" : "text-loss"}`}
          >
            {netProfit >= 0 ? "+" : ""}
            {netProfit.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-semibold text-muted">Record</p>
          <p className="mt-2 text-3xl font-black tabular-nums">
            <span className="text-win">{wins}</span>
            <span className="text-muted mx-1">/</span>
            <span className="text-loss">{losses}</span>
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 mb-6">
        <p className="text-sm font-bold mb-3">Top up play money</p>
        <div className="flex flex-wrap gap-2">
          {TOP_UPS.map((amt) => (
            <button
              key={amt}
              onClick={() => addFunds(amt)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:border-accent transition-colors"
            >
              +{amt}
            </button>
          ))}
          <button
            onClick={resetBalance}
            className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-4 py-2 text-sm font-semibold text-muted hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to 1,000
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold">Recent activity</p>
          {history.length > 0 && (
            <button
              onClick={() => useCasinoStore.setState({ history: [] })}
              className="flex items-center gap-1 text-xs text-muted hover:text-loss"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-muted">No bets placed yet. Go play a game!</p>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="pb-2 pr-4 font-semibold">Game</th>
                  <th className="pb-2 pr-4 font-semibold">Bet</th>
                  <th className="pb-2 pr-4 font-semibold">Multiplier</th>
                  <th className="pb-2 pr-4 font-semibold">Payout</th>
                  <th className="pb-2 font-semibold">When</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 50).map((tx) => (
                  <tr key={tx.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-4 font-semibold">{gameLabel(tx.game)}</td>
                    <td className="py-2 pr-4 tabular-nums">{tx.betAmount.toFixed(2)}</td>
                    <td className="py-2 pr-4 tabular-nums">{tx.multiplier.toFixed(2)}×</td>
                    <td
                      className={`py-2 pr-4 tabular-nums font-semibold ${
                        tx.result === "win" ? "text-win" : "text-loss"
                      }`}
                    >
                      {tx.result === "win" ? "+" : "-"}
                      {tx.result === "win" ? tx.payout.toFixed(2) : tx.betAmount.toFixed(2)}
                    </td>
                    <td className="py-2 text-muted whitespace-nowrap">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
