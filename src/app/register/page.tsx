"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registrierung fehlgeschlagen");

      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) throw new Error("Automatische Anmeldung fehlgeschlagen. Bitte logge dich manuell ein.");

      const next = searchParams.get("next");
      router.push(next === "pricing" ? "/#pricing" : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etwas ist schiefgelaufen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-950 px-6 bg-grid-glow">
      <div className="glass-card w-full max-w-md p-8">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">← Zurück</Link>
        <h1 className="mt-4 text-2xl font-bold text-white">Konto erstellen</h1>
        <p className="mt-1 text-sm text-slate-400">
          Registriere dich kostenlos, wähle danach deinen Plan.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-300">Name</label>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-accent-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">E-Mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-accent-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Passwort</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-accent-500"
            />
            <p className="mt-1 text-xs text-slate-500">Mindestens 8 Zeichen.</p>
          </div>

          {error && <p className="text-sm text-danger-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "Wird erstellt…" : "Konto erstellen"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Bereits registriert?{" "}
          <Link href="/login" className="text-accent-400 hover:underline">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
