"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useCasinoStore } from "@/lib/store";

export default function SignInModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const username = useCasinoStore((s) => s.username);
  const setUsername = useCasinoStore((s) => s.setUsername);
  const [value, setValue] = useState(username ?? "");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{username ? "Edit profile" : "Create a play-money profile"}</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted mb-4">
          No email, no password, no real money. This just sets a local display name for your
          browser session.
        </p>

        <label className="block text-xs font-semibold text-muted mb-1">Display name</label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={20}
          placeholder="e.g. LuckyNomad"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />

        <div className="mt-5 flex gap-2">
          {username && (
            <button
              onClick={() => {
                setUsername(null);
                setValue("");
                onClose();
              }}
              className="flex-1 rounded-lg border border-border py-2 text-sm font-semibold text-muted hover:text-foreground"
            >
              Sign out
            </button>
          )}
          <button
            onClick={() => {
              setUsername(value.trim() || "Player");
              onClose();
            }}
            className="flex-1 rounded-lg bg-accent py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
