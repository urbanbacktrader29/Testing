"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Wie schnell erhalte ich neue Signale?",
    a: "Signale erscheinen live in deinem Dashboard, sobald unser System ein neues Setup identifiziert — ohne Verzögerung, ohne manuelles Aktualisieren.",
  },
  {
    q: "Kann ich mit Kryptowährung bezahlen?",
    a: "Ja. Neben Kreditkarte kannst du dein Abo direkt mit Bitcoin, Ethereum und weiteren Kryptowährungen bezahlen.",
  },
  {
    q: "Kann ich jederzeit kündigen?",
    a: "Ja, dein Abo ist monatlich und kann jederzeit ohne Mindestlaufzeit gekündigt werden.",
  },
  {
    q: "Für welche Märkte gibt es Signale?",
    a: "Wir decken Forex-Majors, die größten Kryptowährungen, wichtige Indizes und Gold ab.",
  },
  {
    q: "Sind die Signale eine Anlageberatung?",
    a: "Nein. SignalPro liefert Marktanalysen zu Informationszwecken. Trading ist mit Risiken verbunden — handle stets eigenverantwortlich und nur mit Kapital, dessen Verlust du dir leisten kannst.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <h2 className="section-heading">Häufig gestellte Fragen</h2>
      </div>

      <div className="mt-12 space-y-3">
        {faqs.map((faq, i) => (
          <div key={faq.q} className="glass-card overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <span className="font-medium text-white">{faq.q}</span>
              <span className="text-accent-400">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div className="px-6 pb-4 text-sm text-slate-400">{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
