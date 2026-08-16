# SignalPro

Abo-Web-App für Trading-Signale: eine lange, konversionsoptimierte Landingpage
führt Besucher zur Registrierung und zum monatlichen Abo (Karte oder Krypto),
danach erhalten sie Zugriff auf ein Live-Dashboard mit Trading-Signalen.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** für das Design
- **Prisma** + SQLite (austauschbar gegen Postgres via `DATABASE_URL`)
- **NextAuth** (Credentials-Provider, JWT-Sessions)
- **Stripe Checkout** für Kartenzahlungen
- **NOWPayments** für Krypto-Zahlungen (Bitcoin, Ethereum, …)
- **Server-Sent Events** für den Live-Signal-Feed im Dashboard

## Setup

```bash
npm install
cp .env.example .env   # Werte eintragen
npm run db:push        # Schema in die DB schreiben
npm run db:seed        # Demo-User + Demo-Signale anlegen
npm run dev
```

Demo-Login nach dem Seed: `demo@signalpro.app` / `password123` (hat bereits
ein aktives Abo, um das Dashboard direkt zu testen).

## Zahlungen konfigurieren

**Stripe:** `STRIPE_SECRET_KEY` setzen. Für Produktion zusätzlich einen
Webhook auf `/api/webhooks/stripe` für die Events `checkout.session.completed`,
`invoice.paid` und `customer.subscription.deleted` einrichten und
`STRIPE_WEBHOOK_SECRET` setzen. Optional `STRIPE_PRICE_ID`, um ein fest
angelegtes Recurring-Price-Objekt zu verwenden statt eines Ad-hoc-Preises.

**Krypto (NOWPayments):** Account auf nowpayments.io anlegen,
`NOWPAYMENTS_API_KEY` und `NOWPAYMENTS_IPN_SECRET` setzen und die
IPN-Callback-URL auf `/api/webhooks/crypto` zeigen lassen.

Ohne konfigurierte Keys geben die Checkout-Endpunkte einen klaren
503-Fehler zurück, statt fehlzuschlagen.

## Architektur-Hinweise

- Der Zugriff auf `/dashboard` und `/api/signals*` prüft sowohl
  Authentifizierung als auch ein aktives Abo (`subscriptionStatus === ACTIVE`
  und `subscriptionExpires` in der Zukunft).
- Die "Live"-Signale werden serverseitig generiert (`src/lib/signals.ts`) und
  per SSE alle ~12s an verbundene Clients gepusht. Für eine echte
  Marktdatenanbindung ersetzt man `generateRandomSignal` durch einen Feed von
  einem Broker/Datenanbieter.
- Für Produktion: `DATABASE_URL` auf Postgres umstellen, hinter einem
  Long-Running-Node-Prozess deployen (SSE braucht persistente Verbindungen,
  klassische Serverless-Functions sind dafür ungeeignet).
