const parts = [
  { label: "Materia prima", note: "Costo industriale del prodotto", value: "placeholder" },
  { label: "Distribuzione e margine", note: "Logistica, rete e gestione punto vendita", value: "placeholder" },
  { label: "Accise", note: "Imposte fisse applicate ai carburanti", value: "placeholder" },
  { label: "IVA", note: "Imposta calcolata sul prezzo finale imponibile", value: "placeholder" }
];

export function FuelComposition() {
  return (
    <section className="rounded-md border border-ink/10 bg-white p-4 shadow-sm" aria-labelledby="composizione">
      <h2 id="composizione" className="text-xl font-black text-ink">
        Composizione del prezzo
      </h2>
      <p className="mt-2 text-sm text-ink/66">
        Struttura pronta per dati verificati. Per ora non inventiamo percentuali: meglio onesti che creativi col conto.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {parts.map((part) => (
          <article key={part.label} className="rounded-md bg-ink/[0.035] p-3">
            <p className="font-black text-ink">{part.label}</p>
            <p className="mt-1 text-sm text-ink/62">{part.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
