const problems = [
  {
    title: "Stundenlang Charts analysieren",
    text: "Du verbringst deine Abende mit Chartanalyse, statt Zeit für dich oder deinen Job zu haben.",
  },
  {
    title: "Emotionale Entscheidungen",
    text: "FOMO und Angst führen zu Einstiegen ohne klaren Plan — und am Ende zu vermeidbaren Verlusten.",
  },
  {
    title: "Kein verlässliches Risikomanagement",
    text: "Ohne klare Stop-Loss- und Take-Profit-Level wird jedes Investment zum Glücksspiel.",
  },
];

export function ProblemSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="section-heading">Kennst du dieses Problem?</h2>
        <p className="mt-4 text-slate-400">
          Die meisten Trader scheitern nicht an fehlendem Wissen, sondern an fehlender
          Struktur, Zeit und Disziplin.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {problems.map((problem) => (
          <div key={problem.title} className="glass-card p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-danger-500/10 text-danger-400">
              ✕
            </div>
            <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{problem.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
