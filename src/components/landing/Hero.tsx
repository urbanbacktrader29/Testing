import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-grid-glow">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-24 pt-20 text-center sm:pt-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent-400" />
          412 Signale live diesen Monat versendet
        </div>

        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
          Live Trading-Signale, die
          <span className="gradient-text"> deinem Trading einen echten Vorsprung</span> geben
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
          Forex, Krypto, Indizes und Metalle — jeden Tag in Echtzeit mit Einstieg,
          Stop-Loss und Take-Profit direkt aufs Dashboard. Von Tradern getestet,
          von Daten bestätigt.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="#pricing" className="btn-primary text-base">
            Jetzt Zugang sichern — ab 49&nbsp;€/Monat
          </Link>
          <Link href="#performance" className="btn-secondary text-base">
            Performance ansehen
          </Link>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Kündbar jederzeit · Zahlung per Karte oder Krypto · Kein Risiko-Freetext-Versprechen
        </p>
      </div>
    </section>
  );
}
