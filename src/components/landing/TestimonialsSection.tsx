const testimonials = [
  {
    name: "Markus R.",
    role: "Daytrader, Krypto & Forex",
    text: "Endlich muss ich nicht mehr stundenlang vor dem Chart sitzen. Die Signale sind präzise und die Risikoangaben machen mein Money-Management viel einfacher.",
  },
  {
    name: "Julia H.",
    role: "Teilzeit-Trader",
    text: "Ich handle neben meinem Job und SignalPro gibt mir die Struktur, die mir vorher gefehlt hat. Die Zahlung per Krypto war ein netter Bonus.",
  },
  {
    name: "Daniel K.",
    role: "Swing-Trader, Indizes",
    text: "Das Live-Dashboard ist genau das, was ich gesucht habe — sofortige Updates, klare Levels, keine Ausreden mehr.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="section-heading">Was unsere Trader sagen</h2>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t.name} className="glass-card p-6">
            <div className="mb-3 text-gold-400">★★★★★</div>
            <p className="text-sm text-slate-300">&ldquo;{t.text}&rdquo;</p>
            <div className="mt-4 text-sm font-semibold text-white">{t.name}</div>
            <div className="text-xs text-slate-500">{t.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
