import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { mockNews } from "@/mocks/news";
import { defaultOgImage, siteName, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Notizie Carburanti",
  description: "Guide e aggiornamenti su prezzi carburanti, accise, self service e risparmio alla pompa.",
  alternates: { canonical: "/notizie" },
  openGraph: {
    title: `Notizie Carburanti | ${siteName}`,
    description: "Guide e aggiornamenti su prezzi carburanti, accise, self service e risparmio alla pompa.",
    url: "/notizie",
    type: "website",
    locale: "it_IT",
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: `${siteName} - guide carburanti` }]
  },
  twitter: {
    card: "summary_large_image",
    title: `Notizie Carburanti | ${siteName}`,
    description: "Guide e aggiornamenti su prezzi carburanti, accise, self service e risparmio alla pompa.",
    images: [defaultOgImage]
  }
};

export default function NewsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Notizie carburanti",
    description: "Guide e aggiornamenti su prezzi carburanti, accise, self service e risparmio alla pompa.",
    url: `${siteUrl}/notizie`,
    inLanguage: "it-IT",
    hasPart: mockNews.map((article) => ({
      "@type": "Article",
      headline: article.title,
      description: article.excerpt,
      datePublished: article.date,
      url: `${siteUrl}/notizie/${article.slug}`
    }))
  };

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="grid gap-3">
          <p className="text-sm font-black uppercase tracking-[0.08em] text-amber">Guide TrovaBenzina</p>
          <h1 className="text-3xl font-black text-ink">Notizie carburanti</h1>
          <p className="max-w-3xl text-ink/68">
            Approfondimenti pratici su prezzo benzina, diesel, GPL, accise e risparmio alla pompa, con collegamenti alle mappe prezzi più consultate.
          </p>
          <nav className="flex flex-wrap gap-2" aria-label="Guide carburante principali">
            {[
              { href: "/prezzo-benzina/milano", label: "Benzina Milano" },
              { href: "/prezzo-diesel/roma", label: "Diesel Roma" },
              { href: "/prezzo-gpl/milano", label: "GPL Milano" },
              { href: "/accise-benzina", label: "Accise benzina" }
            ].map((link) => (
              <Link key={link.href} className="rounded-md border border-petrol/20 bg-white px-3 py-2 text-sm font-black text-petrol hover:border-petrol/45" href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {mockNews.map((article) => (
            <article className="rounded-md border border-ink/10 bg-white p-4 shadow-sm" key={article.slug}>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-amber">{article.category}</p>
              <h2 className="mt-2 text-xl font-black text-ink">
                <Link href={`/notizie/${article.slug}`}>{article.title}</Link>
              </h2>
              <p className="mt-2 text-sm text-ink/68">{article.excerpt}</p>
              <Link className="mt-4 inline-flex text-sm font-black text-petrol hover:underline" href={`/notizie/${article.slug}`}>
                Leggi la guida
              </Link>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
