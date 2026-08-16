const stats = [
  { value: "5.200+", label: "aktive Abonnenten" },
  { value: "68%", label: "durchschnittliche Trefferquote*" },
  { value: "8", label: "Märkte abgedeckt" },
  { value: "24/5", label: "Live-Marktbeobachtung" },
];

export function TrustBar() {
  return (
    <section className="border-y border-white/10 bg-base-900/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-extrabold text-white sm:text-4xl">{stat.value}</div>
            <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>
      <p className="pb-6 text-center text-xs text-slate-600">
        *Historische Performance. Keine Garantie für zukünftige Ergebnisse — Trading ist mit Risiken verbunden.
      </p>
    </section>
  );
}
