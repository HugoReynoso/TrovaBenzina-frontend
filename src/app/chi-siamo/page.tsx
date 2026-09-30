import type { Metadata } from "next";
import Link from "next/link";
import { Github, Globe, Linkedin, Mail } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MAX_PRICE_AGE_DAYS } from "@/lib/price";
import { breadcrumbJsonLd, defaultOgImage, founder, siteName, siteUrl } from "@/lib/seo";

const description =
  "Chi c'è dietro TrovaBenzina, da dove arrivano i prezzi dei carburanti e come vengono controllati. Contatti per segnalazioni, errori e collaborazioni.";

export const metadata: Metadata = {
  title: "Chi siamo e contatti",
  description,
  alternates: { canonical: "/chi-siamo" },
  openGraph: {
    title: `Chi siamo e contatti | ${siteName}`,
    description,
    url: "/chi-siamo",
    type: "website",
    locale: "it_IT",
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: `${siteName} - chi siamo` }]
  }
};

const contacts = [
  { label: "Email", value: founder.email, href: `mailto:${founder.email}`, icon: Mail },
  { label: "LinkedIn", value: "hugo-aldo-reynoso", href: founder.linkedin, icon: Linkedin },
  { label: "GitHub", value: "HugoReynoso", href: founder.github, icon: Github },
  { label: "Sito personale", value: "hugoreynoso.github.io", href: founder.website, icon: Globe }
];

export default function AboutPage() {
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Chi siamo e contatti", path: "/chi-siamo" }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: `Chi siamo e contatti | ${siteName}`,
      url: `${siteUrl}/chi-siamo/`,
      inLanguage: "it-IT",
      mainEntity: {
        "@type": "Organization",
        name: siteName,
        url: siteUrl,
        email: founder.email,
        founder: {
          "@type": "Person",
          name: founder.name,
          jobTitle: founder.jobTitle,
          address: { "@type": "PostalAddress", addressLocality: "Milano", addressCountry: "IT" },
          sameAs: [founder.linkedin, founder.github, founder.website]
        }
      }
    }
  ];

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-3xl gap-6 px-4 py-8 leading-relaxed text-ink/76 md:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <header className="grid gap-2">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-amber">Chi siamo</p>
          <h1 className="text-3xl font-black text-ink">Chi c&apos;è dietro TrovaBenzina</h1>
          <p>
            TrovaBenzina è un progetto indipendente nato a Milano con un obiettivo semplice: aiutare chi guida a trovare il
            distributore più conveniente vicino a sé, con i prezzi ufficiali aggiornati e gratuitamente.
          </p>
        </header>

        <section className="grid gap-2" aria-labelledby="chi-sono">
          <h2 id="chi-sono" className="text-xl font-black text-ink">
            Il progetto e il suo autore
          </h2>
          <p>
            TrovaBenzina è ideato e sviluppato da <strong className="text-ink">{founder.name}</strong>, {founder.jobTitle} con
            base a Milano e oltre 7 anni di esperienza nello sviluppo di applicazioni web per pubblica amministrazione e
            grandi aziende (sicurezza, sanità, logistica, telecomunicazioni e pagamenti).
          </p>
          <p>
            Il sito è costruito con Next.js e React per la parte web e con Java e Spring Boot per il servizio che importa e
            controlla i prezzi.
          </p>
        </section>

        <section className="grid gap-2" aria-labelledby="dati">
          <h2 id="dati" className="text-xl font-black text-ink">
            Da dove arrivano i prezzi
          </h2>
          <p>
            I prezzi sono quelli che i gestori degli impianti sono obbligati per legge a comunicare al{" "}
            <strong className="text-ink">Ministero delle Imprese e del Made in Italy (MIMIT)</strong>, pubblicati come dati
            aperti dall&apos;Osservatorio prezzi carburanti. TrovaBenzina li importa ogni giorno, insieme all&apos;anagrafica
            dei distributori.
          </p>
          <p>Prima di mostrarli, i prezzi vengono controllati:</p>
          <ul className="grid list-disc gap-1 pl-5">
            <li>
              nelle classifiche e sulla mappa compaiono solo i prezzi comunicati nei {MAX_PRICE_AGE_DAYS} giorni precedenti
              l&apos;ultimo aggiornamento disponibile;
            </li>
            <li>
              vengono scartati i prezzi palesemente sbagliati (per esempio 0,123 € o 9,999 € al litro) confrontandoli con
              quelli della stessa zona;
            </li>
            <li>
              il &quot;prezzo tipico&quot; di una zona è la mediana dei prezzi, così pochi distributori molto cari non
              falsano il confronto.
            </li>
          </ul>
          <p>
            I dati non sono in tempo reale: tra la comunicazione del gestore e la pubblicazione possono passare alcune ore. Il
            prezzo esposto alla pompa è sempre quello che fa fede.
          </p>
        </section>

        <section className="grid gap-2" aria-labelledby="indipendenza">
          <h2 id="indipendenza" className="text-xl font-black text-ink">
            Indipendenza
          </h2>
          <p>
            TrovaBenzina non è affiliato ad alcuna compagnia petrolifera né al MIMIT: l&apos;ordine delle classifiche e
            della mappa dipende solo dal prezzo comunicato.
          </p>
        </section>

        <section className="grid gap-3" aria-labelledby="contatti">
          <h2 id="contatti" className="text-xl font-black text-ink">
            Contatti
          </h2>
          <p>
            Hai trovato un prezzo sbagliato, un distributore che non esiste più o vuoi proporre una collaborazione? Scrivi
            pure. Per un prezzo diverso da quello esposto puoi anche usare la pagina{" "}
            <Link className="font-black text-petrol hover:underline" href="/segnala-prezzo">
              Segnala un prezzo
            </Link>
            .
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {contacts.map((contact) => {
              const Icon = contact.icon;
              const isExternal = !contact.href.startsWith("mailto:");
              return (
                <li key={contact.label}>
                  <a
                    className="flex items-center gap-3 rounded-md border border-ink/10 bg-white p-3 shadow-sm transition hover:border-petrol/40"
                    href={contact.href}
                    {...(isExternal ? { target: "_blank", rel: "noopener me" } : {})}
                  >
                    <Icon className="shrink-0 text-petrol" size={20} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-xs font-black uppercase tracking-[0.08em] text-ink/60">{contact.label}</span>
                      <span className="block truncate font-bold text-ink">{contact.value}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
