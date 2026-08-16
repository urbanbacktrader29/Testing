"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-base-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-500 text-base-950">
            S
          </span>
          SignalPro
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">Funktionen</a>
          <a href="#performance" className="hover:text-white">Performance</a>
          <a href="#pricing" className="hover:text-white">Preise</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <>
              <Link href="/dashboard" className="btn-secondary !px-4 !py-2 text-sm">
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-slate-400 hover:text-white"
              >
                Abmelden
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white">
                Login
              </Link>
              <Link href="/register" className="btn-primary !px-4 !py-2 text-sm">
                Jetzt starten
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
