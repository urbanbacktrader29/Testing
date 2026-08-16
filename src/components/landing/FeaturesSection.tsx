const features = [
  {
    icon: "⚡",
    title: "Echtzeit-Signale",
    text: "Neue Signale erscheinen live in deinem Dashboard — inklusive Einstieg, Stop-Loss und Take-Profit.",
  },
  {
    icon: "🎯",
    title: "Klares Risikomanagement",
    text: "Jedes Signal enthält ein definiertes Risiko-Ertrags-Verhältnis, damit du diszipliniert bleibst.",
  },
  {
    icon: "🌍",
    title: "8 Märkte abgedeckt",
    text: "Forex-Majors, Krypto, Indizes und Gold — alles an einem Ort, rund um die Uhr beobachtet.",
  },
  {
    icon: "🔔",
    title: "Sofortige Benachrichtigung",
    text: "Verpasse kein Signal mehr — dein Dashboard aktualisiert sich live per Streaming-Verbindung.",
  },
  {
    icon: "🔒",
    title: "Sicherer Zugang",
    text: "Verschlüsselte Anmeldung und Zahlungsabwicklung, jederzeit kündbar.",
  },
  {
    icon: "₿",
    title: "Zahlung per Karte oder Krypto",
    text: "Bezahle bequem mit Kreditkarte oder direkt mit Bitcoin, Ethereum & Co.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-white/5 bg-base-900/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-heading">Alles, was du für profitables Trading brauchst</h2>
          <p className="mt-4 text-slate-400">
            Ein Tool, ein Preis, volle Transparenz — konzipiert für Trader, die Ergebnisse wollen.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="glass-card p-6 transition hover:border-accent-500/30">
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
