import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "SignalPro — Live Trading Signals for Serious Traders",
  description:
    "Institutional-grade live trading signals for forex, crypto, indices and metals. Subscribe monthly with card or crypto and trade with an edge.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
