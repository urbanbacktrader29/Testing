import { create } from "zustand";
import { persist } from "zustand/middleware";
import { randomHex, sha256Hex } from "./fairness";
import type { GameId, RevealedSeed, Transaction } from "./types";

const STARTING_BALANCE = 1000;

interface CasinoState {
  hasHydrated: boolean;
  fairnessReady: boolean;

  username: string | null;
  balance: number;
  history: Transaction[];

  clientSeed: string;
  serverSeed: string;
  serverSeedHash: string;
  nonce: number;
  revealedSeeds: RevealedSeed[];

  setHasHydrated: (v: boolean) => void;
  ensureFairnessInit: () => Promise<void>;

  setUsername: (name: string | null) => void;
  setClientSeed: (seed: string) => void;
  rotateServerSeed: () => Promise<void>;

  resetBalance: () => void;
  addFunds: (amount: number) => void;
  debit: (amount: number) => boolean;
  credit: (amount: number) => void;

  consumeNonce: () => { nonce: number; serverSeed: string; clientSeed: string; serverSeedHash: string };
  logTransaction: (tx: Omit<Transaction, "id" | "timestamp">) => void;
}

export const useCasinoStore = create<CasinoState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      fairnessReady: false,

      username: null,
      balance: STARTING_BALANCE,
      history: [],

      clientSeed: "",
      serverSeed: "",
      serverSeedHash: "",
      nonce: 0,
      revealedSeeds: [],

      setHasHydrated: (v) => set({ hasHydrated: v }),

      ensureFairnessInit: async () => {
        if (get().fairnessReady) return;
        const needsSeed = !get().serverSeed;
        const needsClient = !get().clientSeed;
        if (needsSeed) {
          const serverSeed = randomHex(32);
          const serverSeedHash = await sha256Hex(serverSeed);
          set({ serverSeed, serverSeedHash, nonce: 0 });
        }
        if (needsClient) {
          set({ clientSeed: randomHex(8) });
        }
        set({ fairnessReady: true });
      },

      setUsername: (name) => set({ username: name }),

      setClientSeed: (seed) => set({ clientSeed: seed || randomHex(8) }),

      rotateServerSeed: async () => {
        const { serverSeed, serverSeedHash, clientSeed, nonce } = get();
        const revealed: RevealedSeed = {
          serverSeed,
          serverSeedHash,
          clientSeed,
          finalNonce: nonce,
          revealedAt: Date.now(),
        };
        const nextServerSeed = randomHex(32);
        const nextServerSeedHash = await sha256Hex(nextServerSeed);
        set((s) => ({
          serverSeed: nextServerSeed,
          serverSeedHash: nextServerSeedHash,
          nonce: 0,
          revealedSeeds: [revealed, ...s.revealedSeeds].slice(0, 25),
        }));
      },

      resetBalance: () => set({ balance: STARTING_BALANCE }),
      addFunds: (amount) => set((s) => ({ balance: s.balance + amount })),

      debit: (amount) => {
        const { balance } = get();
        if (amount <= 0 || amount > balance) return false;
        set({ balance: balance - amount });
        return true;
      },

      credit: (amount) => set((s) => ({ balance: s.balance + amount })),

      consumeNonce: () => {
        const { nonce, serverSeed, clientSeed, serverSeedHash } = get();
        set({ nonce: nonce + 1 });
        return { nonce, serverSeed, clientSeed, serverSeedHash };
      },

      logTransaction: (tx) =>
        set((s) => ({
          history: [
            { ...tx, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, timestamp: Date.now() },
            ...s.history,
          ].slice(0, 200),
        })),
    }),
    {
      name: "fortuna-casino-store",
      skipHydration: true,
    }
  )
);

export function gameLabel(game: GameId): string {
  switch (game) {
    case "dice":
      return "Dice";
    case "mines":
      return "Mines";
    case "crash":
      return "Crash";
    case "plinko":
      return "Plinko";
  }
}
