import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FuelComposition } from "@/features/statistics/FuelComposition";
import { breadcrumbJsonLd, defaultOgImage, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Accise Benzina - Composizione del Prezzo",
  description: "Scopri come funziona il prezzo della benzina tra carburante, rete, accisa fissa e IVA.",
  alternates: { canonical: "/accise-benzina" },
  openGraph: {
    title: `Accise Benzina - Composizione del Prezzo | ${siteName}`,
    description: "Scopri come funziona il prezzo della benzina tra carburante, rete, accisa fissa e IVA.",
    url: "/accise-benzina",
    type: "article",
    locale: "it_IT",
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: `${siteName} - accise benzina` }]
  },
  twitter: {
    card: "summary_large_image",
    title: `Accise Benzina - Composizione del Prezzo | ${siteName}`,
    description: "Scopri come funziona il prezzo della benzina tra carburante, rete, accisa fissa e IVA.",
    images: [defaultOgImage]
  }
};

export default function AccisePage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Accise benzina", path: "/accise-benzina" }
  ]);

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <h1 className="text-3xl font-black text-ink">Accise benzina</h1>
        <p className="max-w-3xl text-ink/70">
          Qui trovi la versione meno fumosa possibile: il prezzo del carburante cambia, l&apos;accisa e una tassa fissa per unita di carburante, mentre
          l&apos;IVA e la parte percentuale applicata sull&apos;imponibile.
        </p>
        <FuelComposition detailed />
        <section className="grid gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm md:grid-cols-3" aria-labelledby="accise-dettagli">
          <div className="md:col-span-3">
            <h2 id="accise-dettagli" className="text-xl font-black text-ink">
              Cosa significa in pratica
            </h2>
          </div>
          <article className="rounded-md bg-ink/[0.035] p-4">
            <p className="font-black text-ink">Accisa: importo fisso</p>
            <p className="mt-2 text-sm text-ink/66">
              Non e una fetta percentuale del prezzo: viene applicata come importo fisso per unita di carburante.
            </p>
          </article>
          <article className="rounded-md bg-ink/[0.035] p-4">
            <p className="font-black text-ink">IVA: percentuale</p>
            <p className="mt-2 text-sm text-ink/66">
              L&apos;IVA resta la componente percentuale e viene calcolata sull&apos;imponibile, che include anche l&apos;effetto delle accise.
            </p>
          </article>
          <article className="rounded-md bg-ink/[0.035] p-4">
            <p className="font-black text-ink">Grafico illustrativo</p>
            <p className="mt-2 text-sm text-ink/66">
              L&apos;infografica mostra le famiglie di costo senza fingere una suddivisione ufficiale aggiornata al centesimo.
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
