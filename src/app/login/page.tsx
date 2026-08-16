"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("E-Mail oder Passwort ist falsch.");
      return;
    }

    const next = searchParams.get("next");
    router.push(next === "pricing" ? "/#pricing" : "/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-950 px-6 bg-grid-glow">
      <div className="glass-card w-full max-w-md p-8">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">← Zurück</Link>
        <h1 className="mt-4 text-2xl font-bold text-white">Willkommen zurück</h1>
        <p className="mt-1 text-sm text-slate-400">Melde dich an, um deine Live-Signale zu sehen.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-accent-500"
            />
          </div>

          {error && <p className="text-sm text-danger-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "Wird angemeldet…" : "Anmelden"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Noch kein Konto?{" "}
          <Link href="/register" className="text-accent-400 hover:underline">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
