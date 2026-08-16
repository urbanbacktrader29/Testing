"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const included = [
  "Unbegrenzte Live-Signale in Echtzeit",
  "Forex, Krypto, Indizes & Metalle",
  "Einstieg, Stop-Loss & Take-Profit je Signal",
  "Live-Dashboard mit Streaming-Updates",
  "Jederzeit kündbar",
];

export function PricingSection() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<"stripe" | "crypto" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(provider: "stripe" | "crypto") {
    setError(null);

    if (status !== "authenticated") {
      router.push(`/register?next=pricing`);
      return;
    }

    setLoading(provider);
    try {
      const res = await fetch(`/api/checkout/${provider}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout fehlgeschlagen");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etwas ist schiefgelaufen");
      setLoading(null);
    }
  }

  return (
    <section id="pricing" className="border-t border-white/5 bg-base-900/40 py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-heading">Ein Plan. Voller Zugang.</h2>
          <p className="mt-4 text-slate-400">
            Keine versteckten Kosten, keine Staffelung — nur ein transparenter Monatspreis.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-md">
          <div className="glass-card relative overflow-hidden border-accent-500/30 p-8">
            <div className="absolute right-4 top-4 rounded-full bg-accent-500/15 px-3 py-1 text-xs font-semibold text-accent-400">
              Am beliebtesten
            </div>

            <h3 className="text-xl font-bold text-white">SignalPro Monatlich</h3>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-5xl font-extrabold text-white">49&nbsp;€</span>
              <span className="mb-1 text-slate-400">/ Monat</span>
            </div>

            <ul className="mt-6 space-y-3">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-0.5 text-accent-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => handleCheckout("stripe")}
                disabled={loading !== null}
                className="btn-primary w-full disabled:opacity-60"
              >
                {loading === "stripe" ? "Wird geladen…" : "Mit Karte abonnieren"}
              </button>
              <button
                onClick={() => handleCheckout("crypto")}
                disabled={loading !== null}
                className="btn-secondary w-full disabled:opacity-60"
              >
                {loading === "crypto" ? "Wird geladen…" : "₿ Mit Krypto bezahlen"}
              </button>
            </div>

            {error && <p className="mt-4 text-sm text-danger-400">{error}</p>}

            <p className="mt-6 text-center text-xs text-slate-500">
              Sichere Zahlungsabwicklung via Stripe & NOWPayments. Jederzeit kündbar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
