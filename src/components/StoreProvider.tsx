"use client";

import { useEffect } from "react";
import { useCasinoStore } from "@/lib/store";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useCasinoStore.persist.rehydrate();
    useCasinoStore.setState({ hasHydrated: true });
    void useCasinoStore.getState().ensureFairnessInit();
  }, []);

  return <>{children}</>;
}
