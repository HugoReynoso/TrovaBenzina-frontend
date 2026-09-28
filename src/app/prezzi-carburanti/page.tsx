import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCities } from "@/lib/api/cities";
import { breadcrumbJsonLd, cityFuelPath, defaultOgImage, siteName } from "@/lib/seo";
import { getSeoCities, groupCitiesByRegion } from "@/lib/seo-cities";

const title = "Prezzi carburanti per città: benzina, diesel e GPL in tutti i capoluoghi";
const description =
  "Elenco dei capoluoghi di provincia italiani divisi per regione: confronta il prezzo di benzina, diesel e GPL oggi e trova i distributori più economici della tua città.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/prezzi-carburanti" },
  openGraph: {
    title: `${title} | ${siteName}`,
    description,
    url: "/prezzi-carburanti",
    type: "website",
    locale: "it_IT",
    siteName,
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: `${siteName} - prezzi carburanti per città` }]
  }
};

export default async function FuelPricesIndexPage() {
  const cities = getSeoCities(await getCities());
  const regions = groupCitiesByRegion(cities);
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Prezzi carburanti per città", path: "/prezzi-carburanti" }];

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }} />
        <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink/58" aria-label="Breadcrumb">
          <Link className="hover:text-petrol" href="/">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">Prezzi carburanti per città</span>
        </nav>
        <header className="grid gap-2 rounded-md border border-ink/10 bg-white p-4 shadow-sm md:p-5">
          <h1 className="text-2xl font-black leading-tight text-ink md:text-4xl">Prezzi carburanti per città</h1>
          <p className="max-w-4xl text-ink/70">
            Scegli il tuo capoluogo per vedere il prezzo di benzina, diesel e GPL oggi, la mappa dei distributori e la classifica dei più economici
            della provincia. I prezzi provengono dalle comunicazioni ufficiali dei gestori al MIMIT.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {regions.map((region) => (
            <section key={region.regionName} className="rounded-md border border-ink/10 bg-white p-4 shadow-sm" aria-labelledby={`regione-${region.regionName}`}>
              <h2 id={`regione-${region.regionName}`} className="text-lg font-black text-ink">
                {region.regionName}
              </h2>
              <ul className="mt-3 grid gap-2">
                {region.cities.map((city) => (
                  <li key={city.slug} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <Link className="font-black text-petrol hover:underline" href={cityFuelPath("BENZINA", city.slug)}>
                      Prezzo benzina {city.name}
                    </Link>
                    <span className="text-sm text-ink/58">
                      <Link className="hover:text-petrol hover:underline" href={cityFuelPath("DIESEL", city.slug)}>
                        diesel
                      </Link>
                      {" · "}
                      <Link className="hover:text-petrol hover:underline" href={cityFuelPath("GPL", city.slug)}>
                        GPL
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
