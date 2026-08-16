"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type Signal = {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL";
  entry: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  timeframe: string;
  note: string;
  createdAt: string;
};

export function SignalFeed() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const source = new EventSource("/api/signals/stream");
    sourceRef.current = source;

    source.addEventListener("open", () => setConnected(true));
    source.addEventListener("error", () => setConnected(false));

    source.addEventListener("initial", (e) => {
      const data = JSON.parse(e.data) as Signal[];
      setSignals(data);
    });

    source.addEventListener("signal", (e) => {
      const signal = JSON.parse(e.data) as Signal;
      setSignals((prev) => [signal, ...prev].slice(0, 50));
    });

    return () => source.close();
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
        <span
          className={clsx(
            "h-2 w-2 rounded-full",
            connected ? "bg-accent-400 animate-pulse-slow" : "bg-slate-600"
          )}
        />
        {connected ? "Live verbunden" : "Verbinde…"}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {signals.map((signal) => (
          <div key={signal.id} className="glass-card p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-slate-200">
                {signal.symbol}
              </span>
              <span
                className={clsx(
                  "rounded px-2 py-0.5 text-xs font-bold",
                  signal.direction === "BUY"
                    ? "bg-accent-500/20 text-accent-400"
                    : "bg-danger-500/20 text-danger-400"
                )}
              >
                {signal.direction}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div>
                <dt className="text-slate-500">Einstieg</dt>
                <dd className="font-mono text-slate-200">{signal.entry}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Stop-Loss</dt>
                <dd className="font-mono text-danger-400">{signal.stopLoss}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Take-Profit</dt>
                <dd className="font-mono text-accent-400">{signal.takeProfit}</dd>
              </div>
            </dl>

            <p className="mt-3 text-xs text-slate-400">{signal.note}</p>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Confidence {signal.confidence}%</span>
              <span>{signal.timeframe}</span>
              <span>{new Date(signal.createdAt).toLocaleTimeString("de-DE")}</span>
            </div>
          </div>
        ))}

        {signals.length === 0 && (
          <p className="col-span-full text-sm text-slate-500">Lade Signale…</p>
        )}
      </div>
    </div>
  );
}
