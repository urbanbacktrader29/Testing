"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Coins, Dices, Menu, Sparkles, User, Wallet, X } from "lucide-react";
import { useCasinoStore } from "@/lib/store";
import SignInModal from "./SignInModal";

const NAV_LINKS = [
  { href: "/", label: "Lobby" },
  { href: "/games/dice", label: "Dice" },
  { href: "/games/mines", label: "Mines" },
  { href: "/games/crash", label: "Crash" },
  { href: "/games/plinko", label: "Plinko" },
  { href: "/fairness", label: "Fairness" },
];

export default function Header() {
  const pathname = usePathname();
  const balance = useCasinoStore((s) => s.balance);
  const username = useCasinoStore((s) => s.username);
  const hasHydrated = useCasinoStore((s) => s.hasHydrated);
  const [signInOpen, setSignInOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2">
            <Dices className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Fortuna<span className="text-accent">Play</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-surface-2 text-foreground"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/wallet"
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-semibold hover:border-accent transition-colors"
          >
            <Coins className="h-4 w-4 text-gold" />
            <span suppressHydrationWarning>
              {hasHydrated ? balance.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
            </span>
            <span className="text-muted font-normal">FUN</span>
          </Link>

          <button
            onClick={() => setSignInOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <User className="h-4 w-4" />
            {username ? username : "Sign in"}
          </button>

          <Link
            href="/wallet"
            className="hidden sm:flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold hover:border-accent transition-colors"
          >
            <Wallet className="h-4 w-4" />
            Wallet
          </Link>

          <button
            className="lg:hidden rounded-lg border border-border p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-border px-4 py-2 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pathname === link.href ? "bg-surface-2" : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              setSignInOpen(true);
            }}
            className="mt-1 flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white"
          >
            <Sparkles className="h-4 w-4" />
            {username ? username : "Sign in"}
          </button>
        </nav>
      )}

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </header>
  );
}
