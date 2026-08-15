# FortunaPlay

A free-to-play demo casino built with Next.js, TypeScript, and Tailwind CSS. All balances are
simulated play money ("FUN") with no real-world value — there is no deposit, withdrawal, or
real-money gambling functionality anywhere in this app.

## Games

- **Dice** — pick a win chance and roll under/over a target.
- **Mines** — clear a 5x5 grid while avoiding hidden mines, cash out anytime.
- **Crash** — cash out before the multiplier crashes.
- **Plinko** — drop a ball through pegs into a multiplier bucket.

Every round is generated with a provably-fair HMAC-SHA256 engine (`src/lib/fairness.ts`): a
server seed's hash is committed before any bets are placed, and rotating the seed reveals the
previous one so every past round can be independently re-verified on the `/fairness` page.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4
- Zustand (with localStorage persistence) for wallet/profile/fairness state
- Web Crypto API (`crypto.subtle`) for the provably-fair RNG
