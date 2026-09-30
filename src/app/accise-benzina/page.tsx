import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FuelComposition } from "@/features/statistics/FuelComposition";
import { breadcrumbJsonLd, defaultOgImage, siteName, siteUrl } from "@/lib/seo";

// Aggiornare quando cambia l'aliquota ordinaria (fonte: Agenzia delle Dogane e dei Monopoli).
const UPDATED_AT = "2026-10-01";
const UPDATED_LABEL = "1 ottobre 2026";

const title = "Accise benzina e gasolio 2026: quanto pesano sul prezzo";
const description =
  "Quanto valgono le accise su benzina e gasolio nel 2026, come si calcolano IVA e accisa sul prezzo alla pompa e quanto paghi di tasse su un pieno da 50 litri.";

export const metadata: Metadata = {
  title: "Accise benzina e gasolio 2026",
  description,
  alternates: { canonical: "/accise-benzina" },
  openGraph: {
    title: `${title} | ${siteName}`,
    description,
    url: "/accise-benzina",
    type: "article",
    locale: "it_IT",
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: `${siteName} - accise benzina` }]
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${siteName}`,
    description,
    images: [defaultOgImage]
  }
};

// Esempio con l'aliquota ordinaria 2026 e un prezzo self di 1,900 €/L (IVA 22% inclusa).
const example = [
  { label: "Prezzo alla pompa", value: "1,900 €", note: "prezzo di esempio, self service" },
  { label: "IVA (22%)", value: "0,343 €", note: "1,900 − 1,900 / 1,22" },
  { label: "Accisa", value: "0,673 €", note: "aliquota ordinaria 2026" },
  { label: "Prodotto, trasporto e margine", value: "0,884 €", note: "quello che resta a raffineria, compagnia e gestore" }
];

const faqs = [
  {
    question: "Quanto è l'accisa sulla benzina nel 2026?",
    answer:
      "L'aliquota ordinaria in vigore dal 1° gennaio 2026 è di 672,90 euro ogni 1.000 litri, cioè circa 0,673 euro al litro, a cui si aggiunge l'IVA al 22%. Nel corso dell'anno il Governo può ridurla temporaneamente con un decreto: per l'aliquota in vigore oggi fa fede l'Agenzia delle Dogane e dei Monopoli."
  },
  {
    question: "Benzina e gasolio hanno la stessa accisa?",
    answer:
      "Sì, per l'aliquota ordinaria: con il riallineamento completato il 1° gennaio 2026 l'accisa sulla benzina è scesa di 4,05 centesimi al litro e quella sul gasolio è salita della stessa cifra, arrivando per entrambi a 672,90 euro ogni 1.000 litri. I tagli temporanei decisi per decreto possono però essere diversi tra i due carburanti."
  },
  {
    question: "Quante tasse pago su un pieno da 50 litri?",
    answer:
      "Con benzina a 1,900 euro al litro e l'aliquota ordinaria, su un pieno da 95 euro circa 33,65 euro sono accise e 17,13 euro IVA: in tutto circa 50,78 euro, il 53% di quello che paghi."
  },
  {
    question: "Perché si dice che l'IVA è una tassa sulla tassa?",
    answer:
      "Perché l'IVA al 22% si calcola sul prezzo che comprende già l'accisa. Sui 0,673 euro di accisa per litro si pagano quindi altri 0,148 euro di IVA: circa 7,40 euro su un pieno da 50 litri."
  },
  {
    question: "Se l'accisa è uguale per tutti, perché i prezzi cambiano da un distributore all'altro?",
    answer:
      "Accisa e IVA sono uguali in tutta Italia. A cambiare è la parte che resta a compagnia e gestore: costo di approvvigionamento, marchio, posizione (in autostrada costa di più), servizio self o servito e politiche commerciali. Per questo confrontare i distributori della propria zona fa risparmiare anche 10-15 euro a pieno."
  }
];

export default function AccisePage() {
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Accise benzina", path: "/accise-benzina" }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      image: `${siteUrl}${defaultOgImage}`,
      datePublished: "2026-09-21",
      dateModified: UPDATED_AT,
      author: { "@type": "Organization", name: siteName, url: siteUrl },
      publisher: { "@type": "Organization", name: siteName, url: siteUrl },
      mainEntityOfPage: `${siteUrl}/accise-benzina/`,
      inLanguage: "it-IT"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: "it-IT",
      mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } }))
    }
  ];

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-4xl gap-6 px-4 py-6 leading-relaxed text-ink/76 md:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <header className="grid gap-2">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-amber">Guida · aggiornata al {UPDATED_LABEL}</p>
          <h1 className="text-3xl font-black leading-tight text-ink md:text-4xl">{title}</h1>
          <p className="text-lg">
            Più di metà di quello che paghi alla pompa sono tasse. Ecco quanto valgono le accise nel 2026, come si sommano
            all&apos;IVA e perché, nonostante siano uguali ovunque, il prezzo cambia così tanto da un distributore all&apos;altro.
          </p>
        </header>

        <section className="grid gap-2" aria-labelledby="cosa-sono">
          <h2 id="cosa-sono" className="text-2xl font-black text-ink">
            Cosa sono le accise
          </h2>
          <p>
            L&apos;accisa è un&apos;imposta sulla produzione e sul consumo di alcuni prodotti, tra cui i carburanti. A
            differenza dell&apos;IVA non è una percentuale: è un <strong className="text-ink">importo fisso per litro</strong>,
            che resta lo stesso sia quando il petrolio costa poco sia quando costa tanto. Per questo, quando il prezzo
            industriale scende, alla pompa il calo si sente meno di quanto ci si aspetterebbe.
          </p>
          <p>
            Le accise sono stabilite dalla legge e riscosse dall&apos;Agenzia delle Dogane e dei Monopoli. Nel tempo sono
            state aumentate più volte per finanziare emergenze e ricostruzioni: oggi però non esistono più &quot;voci&quot;
            separate, ma un&apos;unica aliquota per ogni carburante.
          </p>
        </section>

        <section className="grid gap-3" aria-labelledby="quanto-valgono">
          <h2 id="quanto-valgono" className="text-2xl font-black text-ink">
            Quanto valgono le accise nel 2026
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-ink/60">Benzina</p>
              <p className="mt-1 text-2xl font-black text-ink">0,6729 €/litro</p>
              <p className="mt-1 text-sm">672,90 € ogni 1.000 litri, IVA esclusa</p>
            </article>
            <article className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-ink/60">Gasolio</p>
              <p className="mt-1 text-2xl font-black text-ink">0,6729 €/litro</p>
              <p className="mt-1 text-sm">672,90 € ogni 1.000 litri, IVA esclusa</p>
            </article>
          </div>
          <p>
            Sono le <strong className="text-ink">aliquote ordinarie in vigore dal 1° gennaio 2026</strong>, quando si è
            concluso il riallineamento tra i due carburanti: l&apos;accisa sulla benzina è scesa di 4,05 centesimi al litro e
            quella sul gasolio è salita della stessa cifra, così oggi pesano allo stesso modo.
          </p>
          <p>
            Durante il 2026 il Governo è intervenuto più volte con <strong className="text-ink">tagli temporanei</strong>{" "}
            decisi per decreto, di durata e importo diversi per benzina e gasolio. L&apos;aliquota effettivamente in vigore in
            un dato giorno può quindi essere più bassa di quella ordinaria: il riferimento ufficiale è il sito
            dell&apos;Agenzia delle Dogane e dei Monopoli.
          </p>
        </section>

        <section className="grid gap-3" aria-labelledby="esempio">
          <h2 id="esempio" className="text-2xl font-black text-ink">
            Esempio: dove vanno i tuoi soldi su un litro di benzina
          </h2>
          <p>Con l&apos;aliquota ordinaria e un prezzo self di 1,900 € al litro, un litro si divide così:</p>
          <div className="overflow-hidden rounded-md border border-ink/10 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink/[0.035] text-xs uppercase tracking-[0.08em] text-ink/60">
                <tr>
                  <th className="px-4 py-2 font-black">Voce</th>
                  <th className="px-4 py-2 text-right font-black">Per litro</th>
                </tr>
              </thead>
              <tbody>
                {example.map((row) => (
                  <tr key={row.label} className="border-t border-ink/10">
                    <td className="px-4 py-3">
                      <span className="block font-black text-ink">{row.label}</span>
                      <span className="block text-xs text-ink/60">{row.note}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-black tabular-nums text-ink">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Accisa e IVA insieme fanno <strong className="text-ink">1,016 € su 1,900 €</strong>, cioè circa il 53% del prezzo.
            Su un pieno da 50 litri (95 €) sono circa <strong className="text-ink">33,65 € di accise e 17,13 € di IVA</strong>:
            poco più di 50 € di tasse.
          </p>
        </section>

        <section className="grid gap-2" aria-labelledby="tassa-sulla-tassa">
          <h2 id="tassa-sulla-tassa" className="text-2xl font-black text-ink">
            IVA sull&apos;accisa: la &quot;tassa sulla tassa&quot;
          </h2>
          <p>
            L&apos;IVA al 22% si calcola sul prezzo che contiene già l&apos;accisa. Sui 0,673 € di accisa per litro si pagano
            quindi altri <strong className="text-ink">0,148 € di IVA</strong>: circa 7,40 € su un pieno da 50 litri che sono
            tasse calcolate su altre tasse.
          </p>
        </section>

        <section className="grid gap-2" aria-labelledby="perche-cambia">
          <h2 id="perche-cambia" className="text-2xl font-black text-ink">
            Perché il prezzo cambia da un distributore all&apos;altro
          </h2>
          <p>
            Accisa e IVA sono identiche in tutta Italia. La differenza la fa la parte industriale: costo del prodotto,
            trasporto, marchio, posizione del distributore (in autostrada si paga di più) e servizio self o servito. Tra il
            distributore più caro e quello più economico della stessa provincia ci possono essere anche 30 centesimi al
            litro, cioè 15 € su un pieno.
          </p>
          <p>
            Per questo conviene confrontare: su TrovaBenzina trovi i distributori più economici di{" "}
            <Link className="font-black text-petrol hover:underline" href="/prezzo-benzina/milano">
              Milano
            </Link>
            ,{" "}
            <Link className="font-black text-petrol hover:underline" href="/prezzo-benzina/roma">
              Roma
            </Link>
            ,{" "}
            <Link className="font-black text-petrol hover:underline" href="/prezzo-benzina/napoli">
              Napoli
            </Link>{" "}
            e di tutti i{" "}
            <Link className="font-black text-petrol hover:underline" href="/prezzi-carburanti">
              capoluoghi di provincia
            </Link>
            , oppure puoi cercarli sulla{" "}
            <Link className="font-black text-petrol hover:underline" href="/mappa">
              mappa
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3" aria-labelledby="infografica">
          <h2 id="infografica" className="text-2xl font-black text-ink">
            L&apos;infografica (con un po&apos; di ironia)
          </h2>
          <FuelComposition detailed />
        </section>

        <section className="grid gap-3" aria-labelledby="domande">
          <h2 id="domande" className="text-2xl font-black text-ink">
            Domande frequenti
          </h2>
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
              <summary className="cursor-pointer font-black text-ink">{faq.question}</summary>
              <p className="mt-2">{faq.answer}</p>
            </details>
          ))}
        </section>

        <section className="grid gap-2 text-sm" aria-labelledby="fonti">
          <h2 id="fonti" className="text-lg font-black text-ink">
            Fonti
          </h2>
          <p>
            Aliquote: Agenzia delle Dogane e dei Monopoli (
            <a className="font-bold text-petrol hover:underline" href="https://www.adm.gov.it/" target="_blank" rel="noreferrer">
              adm.gov.it
            </a>
            ). Prezzi dei distributori: Ministero delle Imprese e del Made in Italy (
            <a className="font-bold text-petrol hover:underline" href="https://www.mimit.gov.it/" target="_blank" rel="noreferrer">
              mimit.gov.it
            </a>
            ). Approfondimento:{" "}
            <Link className="font-bold text-petrol hover:underline" href="/notizie/accise-iva-prezzo-pompa">
              accise, IVA e prezzo alla pompa
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
