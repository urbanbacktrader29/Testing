export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-base-950 py-10">
      <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} SignalPro. Alle Rechte vorbehalten.</p>
        <p className="mt-2 max-w-2xl mx-auto text-xs text-slate-600">
          Risikohinweis: Der Handel mit Finanzinstrumenten und/oder Kryptowährungen ist mit hohem
          Risiko verbunden und nicht für alle Anleger geeignet. Signale stellen keine
          Anlageberatung dar. Vergangene Ergebnisse sind kein Indikator für zukünftige Ergebnisse.
        </p>
      </div>
    </footer>
  );
}
