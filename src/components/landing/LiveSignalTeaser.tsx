import Link from "next/link";

const previewSignals = [
  { symbol: "BTC/USD", direction: "BUY", confidence: 87, timeframe: "1h" },
  { symbol: "EUR/USD", direction: "SELL", confidence: 74, timeframe: "15m" },
  { symbol: "XAU/USD", direction: "BUY", confidence: 91, timeframe: "4h" },
];

export function LiveSignalTeaser() {
  return (
    <section id="performance" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="section-heading">So sieht dein Live-Dashboard aus</h2>
        <p className="mt-4 text-slate-400">
          Ein Blick auf aktuelle Signale — freigeschaltet für aktive Abonnenten.
        </p>
      </div>

      <div className="relative mt-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {previewSignals.map((signal) => (
            <div key={signal.symbol} className="glass-card p-5 blur-[3px] select-none">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-slate-300">{signal.symbol}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    signal.direction === "BUY"
                      ? "bg-accent-500/20 text-accent-400"
                      : "bg-danger-500/20 text-danger-400"
                  }`}
                >
                  {signal.direction}
                </span>
              </div>
              <div className="mt-4 h-2 w-full rounded bg-white/10" />
              <div className="mt-2 h-2 w-2/3 rounded bg-white/10" />
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Confidence {signal.confidence}%</span>
                <span>{signal.timeframe}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-card flex flex-col items-center gap-4 border-accent-500/30 bg-base-950/90 px-8 py-8 text-center">
            <span className="text-2xl">🔓</span>
            <p className="max-w-xs text-sm text-slate-300">
              Melde dich an und abonniere, um alle Live-Signale in Echtzeit zu sehen.
            </p>
            <Link href="#pricing" className="btn-primary !px-5 !py-2.5 text-sm">
              Zugang freischalten
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
