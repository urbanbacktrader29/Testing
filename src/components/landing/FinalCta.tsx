import Link from "next/link";

export function FinalCta() {
  return (
    <section className="border-t border-white/5 bg-grid-glow py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="section-heading">Bereit für Trading mit Struktur?</h2>
        <p className="mt-4 text-slate-400">
          Schließe dich tausenden Tradern an, die ihre Entscheidungen auf klare,
          datengestützte Signale stützen.
        </p>
        <div className="mt-8">
          <Link href="#pricing" className="btn-primary text-base">
            Jetzt abonnieren
          </Link>
        </div>
      </div>
    </section>
  );
}
