import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCities } from "@/lib/api/cities";
import {
  cityFuelPathFor,
  fuelIndexAlternates,
  isTranslatedCity,
  LOCALE_ROUTES,
  localizedCityName,
  openGraphLocale,
  type Locale
} from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { breadcrumbJsonLd, defaultOgImage, siteName } from "@/lib/seo";
import { getSeoCities, groupCitiesByRegion } from "@/lib/seo-cities";

const COPY: Record<Locale, { home: string; title: string; metaTitle: string; description: string; h1: string; intro: string; cityLink: (city: string) => string }> = {
  it: {
    home: "Home",
    title: "Prezzi carburanti per città",
    metaTitle: "Prezzi carburanti per città: benzina, diesel, GPL e metano in tutti i capoluoghi",
    description:
      "Elenco dei capoluoghi di provincia italiani divisi per regione: confronta il prezzo di benzina, diesel, GPL e metano oggi e trova i distributori più economici della tua città.",
    h1: "Prezzi carburanti per città",
    intro:
      "Scegli il tuo capoluogo per vedere il prezzo di benzina, diesel, GPL e metano oggi, la mappa dei distributori e la classifica dei più economici della provincia. I prezzi provengono dalle comunicazioni ufficiali dei gestori al MIMIT.",
    cityLink: (city) => `Prezzo benzina ${city}`
  },
  en: {
    home: "Home",
    title: "Fuel prices by city",
    metaTitle: "Fuel Prices in Italy by City: Petrol, Diesel and LPG Today",
    description:
      "Petrol, diesel and LPG prices today in Italy's main cities, grouped by region. Find the cheapest fuel stations in Rome, Milan, Florence, Venice, Naples and more.",
    h1: "Fuel prices in Italy by city",
    intro:
      "Choose a city to see today's petrol, diesel and LPG prices, a map of fuel stations and the cheapest ones in the province. Prices come from the official data that Italian fuel stations report to the Ministry of Enterprises (MIMIT).",
    cityLink: (city) => `Petrol price in ${city}`
  },
  es: {
    home: "Inicio",
    title: "Precios del combustible por ciudad",
    metaTitle: "Precio de la gasolina en Italia por ciudad: gasolina, diésel y GLP hoy",
    description:
      "Precios de la gasolina, el diésel y el GLP hoy en las principales ciudades de Italia, por regiones. Encuentra las gasolineras más baratas en Roma, Milán, Florencia, Venecia, Nápoles y más.",
    h1: "Precios del combustible en Italia por ciudad",
    intro:
      "Elige una ciudad para ver el precio de la gasolina, el diésel y el GLP hoy, el mapa de gasolineras y las más baratas de la provincia. Los precios proceden de los datos oficiales que las gasolineras italianas comunican al Ministerio de Empresas (MIMIT).",
    cityLink: (city) => `Precio de la gasolina en ${city}`
  }
};

export function fuelPricesIndexMetadata(locale: Locale): Metadata {
  const copy = COPY[locale];
  const path = LOCALE_ROUTES[locale].fuelIndex;
  return {
    title: copy.metaTitle,
    description: copy.description,
    alternates: { canonical: path, languages: fuelIndexAlternates() },
    openGraph: {
      title: `${copy.metaTitle} | ${siteName}`,
      description: copy.description,
      url: path,
      type: "website",
      locale: openGraphLocale(locale),
      siteName,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: `${siteName} - ${copy.title}` }]
    }
  };
}

export async function FuelPricesIndexPage({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const t = getMessages(locale);
  const routes = LOCALE_ROUTES[locale];
  const allCities = getSeoCities(await getCities());
  const cities = locale === "it" ? allCities : allCities.filter((city) => isTranslatedCity(city.slug));
  const regions = groupCitiesByRegion(cities);
  const breadcrumbs = [
    { name: copy.home, path: routes.home },
    { name: copy.title, path: routes.fuelIndex }
  ];

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }} />
        <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink/58" aria-label="Breadcrumb">
          <Link className="hover:text-petrol" href={routes.home}>
            {copy.home}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{copy.title}</span>
        </nav>
        <header className="grid gap-2 rounded-md border border-ink/10 bg-white p-4 shadow-sm md:p-5">
          <h1 className="text-2xl font-black leading-tight text-ink md:text-4xl">{copy.h1}</h1>
          <p className="max-w-4xl text-ink/70">{copy.intro}</p>
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
                    <Link className="font-black text-petrol hover:underline" href={cityFuelPathFor(locale, "BENZINA", city.slug)}>
                      {copy.cityLink(localizedCityName(locale, city))}
                    </Link>
                    <span className="text-sm text-ink/58">
                      <Link className="hover:text-petrol hover:underline" href={cityFuelPathFor(locale, "DIESEL", city.slug)}>
                        {locale === "it" ? "diesel" : t.fuelInSentence.DIESEL}
                      </Link>
                      {" · "}
                      <Link className="hover:text-petrol hover:underline" href={cityFuelPathFor(locale, "GPL", city.slug)}>
                        {t.fuelName.GPL}
                      </Link>
                      {" · "}
                      <Link className="hover:text-petrol hover:underline" href={cityFuelPathFor(locale, "METANO", city.slug)}>
                        {locale === "it" ? "metano" : t.fuelName.METANO}
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
