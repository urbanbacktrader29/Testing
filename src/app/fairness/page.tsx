"use client";

import { useState } from "react";
import { CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { useCasinoStore } from "@/lib/store";
import { fairFloats, sha256Hex } from "@/lib/fairness";

export default function FairnessPage() {
  const hasHydrated = useCasinoStore((s) => s.hasHydrated);
  const serverSeedHash = useCasinoStore((s) => s.serverSeedHash);
  const clientSeed = useCasinoStore((s) => s.clientSeed);
  const nonce = useCasinoStore((s) => s.nonce);
  const revealedSeeds = useCasinoStore((s) => s.revealedSeeds);
  const setClientSeed = useCasinoStore((s) => s.setClientSeed);
  const rotateServerSeed = useCasinoStore((s) => s.rotateServerSeed);

  const [clientSeedInput, setClientSeedInput] = useState(clientSeed);
  const [rotating, setRotating] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="h-6 w-6 text-accent" />
        <h1 className="text-2xl font-black">Provably Fair</h1>
      </div>
      <p className="text-sm text-muted mb-6 max-w-2xl leading-relaxed">
        Every round is generated from a server seed and your client seed. Before you ever place a
        bet, the SHA-256 hash of the server seed is committed and shown below — proof it can&apos;t
        be changed after the fact. Each outcome comes from{" "}
        <code className="text-xs bg-surface-2 px-1 py-0.5 rounded">
          HMAC_SHA256(serverSeed, clientSeed:nonce:cursor)
        </code>
        , sliced into 32-bit chunks and normalized to [0, 1).
      </p>

      <div className="rounded-2xl border border-border bg-surface p-5 mb-6">
        <p className="text-sm font-bold mb-3">Active round</p>
        <div className="grid gap-3 text-sm">
          <Field label="Server seed hash (committed)" value={hasHydrated ? serverSeedHash : "…"} mono />
          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">Client seed</label>
            <div className="flex gap-2">
              <input
                value={clientSeedInput}
                onChange={(e) => setClientSeedInput(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-mono outline-none focus:border-accent"
              />
              <button
                onClick={() => setClientSeed(clientSeedInput)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:border-accent"
              >
                Save
              </button>
            </div>
          </div>
          <Field label="Current nonce" value={hasHydrated ? String(nonce) : "…"} mono />
        </div>

        <button
          onClick={async () => {
            setRotating(true);
            await rotateServerSeed();
            setRotating(false);
          }}
          disabled={rotating}
          className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${rotating ? "animate-spin" : ""}`} />
          Rotate seed &amp; reveal previous
        </button>
        <p className="text-xs text-muted mt-2">
          Rotating starts a fresh commitment and reveals the previous server seed below so every
          round played under it can be independently re-verified.
        </p>
      </div>

      {revealedSeeds.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5 mb-6">
          <p className="text-sm font-bold mb-3">Revealed seed history</p>
          <div className="flex flex-col gap-3">
            {revealedSeeds.map((r, i) => (
              <RevealedSeedRow key={`${r.serverSeed}-${i}`} seed={r} />
            ))}
          </div>
        </div>
      )}

      <RoundVerifier />
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted mb-1 block">{label}</label>
      <div
        className={`rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs break-all ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function RevealedSeedRow({
  seed,
}: {
  seed: { serverSeed: string; serverSeedHash: string; clientSeed: string; finalNonce: number; revealedAt: number };
}) {
  const [status, setStatus] = useState<"idle" | "checking" | "match" | "mismatch">("idle");

  async function verify() {
    setStatus("checking");
    const hash = await sha256Hex(seed.serverSeed);
    setStatus(hash === seed.serverSeedHash ? "match" : "mismatch");
  }

  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="text-muted">{new Date(seed.revealedAt).toLocaleString()}</span>
        <span className="text-muted">{seed.finalNonce} rounds played</span>
      </div>
      <p className="font-mono break-all">
        <span className="text-muted">seed: </span>
        {seed.serverSeed}
      </p>
      <p className="font-mono break-all mt-1">
        <span className="text-muted">hash: </span>
        {seed.serverSeedHash}
      </p>
      <button
        onClick={verify}
        className="mt-2 flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-semibold hover:border-accent"
      >
        {status === "match" ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-win" />
        ) : (
          <ShieldCheck className="h-3.5 w-3.5" />
        )}
        {status === "idle" && "Verify hash"}
        {status === "checking" && "Checking…"}
        {status === "match" && "Verified — hash matches"}
        {status === "mismatch" && "Mismatch!"}
      </button>
    </div>
  );
}

function RoundVerifier() {
  const [serverSeed, setServerSeed] = useState("");
  const [clientSeed, setClientSeed] = useState("");
  const [nonce, setNonce] = useState(0);
  const [count, setCount] = useState(1);
  const [result, setResult] = useState<number[] | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-sm font-bold mb-1">Manual round verifier</p>
      <p className="text-xs text-muted mb-3">
        Paste a revealed server seed, the client seed and nonce used for a round to recompute its
        raw outcome floats yourself.
      </p>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <input
          value={serverSeed}
          onChange={(e) => setServerSeed(e.target.value)}
          placeholder="Server seed"
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-mono outline-none focus:border-accent"
        />
        <input
          value={clientSeed}
          onChange={(e) => setClientSeed(e.target.value)}
          placeholder="Client seed"
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-mono outline-none focus:border-accent"
        />
        <input
          type="number"
          value={nonce}
          onChange={(e) => setNonce(parseInt(e.target.value, 10) || 0)}
          placeholder="Nonce"
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-mono outline-none focus:border-accent"
        />
        <input
          type="number"
          min={1}
          max={32}
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
          placeholder="Floats to derive"
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-mono outline-none focus:border-accent"
        />
      </div>
      <button
        onClick={async () => {
          if (!serverSeed || !clientSeed) return;
          setBusy(true);
          const floats = await fairFloats(serverSeed, clientSeed, nonce, count);
          setResult(floats);
          setBusy(false);
        }}
        disabled={busy}
        className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Computing…" : "Derive floats"}
      </button>
      {result && (
        <div className="mt-3 rounded-lg bg-surface-2 p-3 text-xs font-mono break-all">
          [{result.map((f) => f.toFixed(6)).join(", ")}]
        </div>
      )}
    </div>
  );
}
