"use client";

import { useCasinoStore } from "@/lib/store";

export default function BetAmountInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const balance = useCasinoStore((s) => s.balance);

  const clamp = (v: number) => Math.max(0, Math.round(v * 100) / 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold text-muted">Bet amount</label>
        <span className="text-xs text-muted">
          Balance: {balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} FUN
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <input
            type="number"
            min={0}
            step={1}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(clamp(parseFloat(e.target.value) || 0))}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 pr-14 text-sm font-semibold outline-none focus:border-accent disabled:opacity-50"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">FUN</span>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(clamp(value / 2))}
          className="rounded-lg border border-border px-2.5 py-2 text-xs font-bold text-muted hover:text-foreground disabled:opacity-50"
        >
          ½
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(clamp(value * 2))}
          className="rounded-lg border border-border px-2.5 py-2 text-xs font-bold text-muted hover:text-foreground disabled:opacity-50"
        >
          2×
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(clamp(balance))}
          className="rounded-lg border border-border px-2.5 py-2 text-xs font-bold text-muted hover:text-foreground disabled:opacity-50"
        >
          Max
        </button>
      </div>
    </div>
  );
}
