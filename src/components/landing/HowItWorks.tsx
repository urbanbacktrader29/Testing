const steps = [
  {
    step: "01",
    title: "Kostenlos registrieren",
    text: "Erstelle in unter einer Minute dein Konto mit E-Mail und Passwort.",
  },
  {
    step: "02",
    title: "Plan wählen & bezahlen",
    text: "Wähle deinen monatlichen Plan und bezahle sicher per Karte oder Krypto.",
  },
  {
    step: "03",
    title: "Live-Signale empfangen",
    text: "Dein Dashboard aktualisiert sich in Echtzeit mit neuen Trading-Signalen.",
  },
  {
    step: "04",
    title: "Diszipliniert traden",
    text: "Nutze Einstieg, Stop-Loss und Take-Profit für jedes Signal — jederzeit kündbar.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-white/5 bg-base-900/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-heading">In 4 Schritten startklar</h2>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div key={item.step} className="relative">
              <div className="text-5xl font-black text-white/10">{item.step}</div>
              <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
