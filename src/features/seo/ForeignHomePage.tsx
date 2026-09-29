import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeExperience } from "@/features/stations/HomeExperience";
import { getCities } from "@/lib/api/cities";
import { getProvinces } from "@/lib/api/provinces";
import { getStations } from "@/lib/api/stations";
import { cityFuelPathFor, homeAlternates, LOCALE_ROUTES, localizedCityName, openGraphLocale, type Locale } from "@/lib/i18n";
import { defaultOgImage, siteName } from "@/lib/seo";
import { buildCityFuelStatistic } from "@/lib/statistics";

type ForeignLocale = Exclude<Locale, "it">;

const FEATURED = ["roma", "milano", "firenze", "venezia", "napoli", "torino", "bologna", "genova"];

const COPY: Record<
  ForeignLocale,
  {
    metaTitle: string;
    description: string;
    h1: string;
    howTitle: string;
    how: string[];
    linksLabel: string;
    cityLink: (city: string) => string;
    allCities: string;
  }
> = {
  en: {
    metaTitle: "TrovaBenzina | Petrol & Diesel Prices in Italy Today – Cheapest Fuel Stations",
    description:
      "Find the cheapest petrol, diesel and LPG in Italy today. Compare fuel station prices on the map, near you or by city, with official data from the Italian Ministry (MIMIT).",
    h1: "Fuel prices in Italy today: find the cheapest petrol station",
    howTitle: "Refuelling in Italy: what to know",
    how: [
      "TrovaBenzina compares petrol (benzina), diesel (gasolio) and LPG (GPL) prices at fuel stations across Italy, using the official prices that every station must report to the Ministry of Enterprises and Made in Italy (MIMIT). Each station shows the date of its latest price update.",
      "Most Italian stations have two prices for the same fuel: \"self\" (self-service), where you fill up yourself, and \"servito\" (full service), where an attendant does it for you at a higher price. At night and on Sundays many stations are self-service only, with payment at an automatic machine by card or cash.",
      "Motorway service areas are usually more expensive than stations on ordinary roads: if you can, fill up before joining the motorway or near an exit."
    ],
    linksLabel: "Fuel prices in the main Italian cities",
    cityLink: (city) => `Petrol price in ${city}`,
    allCities: "All cities →"
  },
  es: {
    metaTitle: "TrovaBenzina | Precio de la gasolina en Italia hoy – Gasolineras más baratas",
    description:
      "Encuentra la gasolina, el diésel y el GLP más baratos de Italia hoy. Compara los precios de las gasolineras en el mapa, cerca de ti o por ciudad, con datos oficiales del Ministerio italiano (MIMIT).",
    h1: "Precio del combustible en Italia hoy: encuentra la gasolinera más barata",
    howTitle: "Repostar en Italia: lo que debes saber",
    how: [
      "TrovaBenzina compara los precios de la gasolina (benzina), el diésel (gasolio) y el GLP (GPL) en las gasolineras de toda Italia, con los precios oficiales que cada gasolinera debe comunicar al Ministerio de Empresas y del Made in Italy (MIMIT). Cada gasolinera muestra la fecha de su última actualización.",
      "La mayoría de las gasolineras italianas tienen dos precios para el mismo combustible: \"self\" (autoservicio), donde repostas tú, y \"servito\" (atendido), donde lo hace un empleado a un precio más alto. Por la noche y los domingos muchas gasolineras funcionan solo en autoservicio, con pago en una máquina automática con tarjeta o efectivo.",
      "Las áreas de servicio de las autopistas suelen ser más caras que las gasolineras de las carreteras normales: si puedes, reposta antes de entrar en la autopista o cerca de una salida."
    ],
    linksLabel: "Precio del combustible en las principales ciudades italianas",
    cityLink: (city) => `Precio de la gasolina en ${city}`,
    allCities: "Todas las ciudades →"
  }
};

export function foreignHomeMetadata(locale: ForeignLocale): Metadata {
  const copy = COPY[locale];
  const path = LOCALE_ROUTES[locale].home;
  return {
    title: { absolute: copy.metaTitle },
    description: copy.description,
    alternates: { canonical: path, languages: homeAlternates() },
    openGraph: {
      title: copy.metaTitle,
      description: copy.description,
      url: path,
      type: "website",
      locale: openGraphLocale(locale),
      siteName,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: copy.metaTitle }]
    },
    twitter: { card: "summary_large_image", title: copy.metaTitle, description: copy.description, images: [defaultOgImage] }
  };
}

export async function ForeignHomePage({ locale }: { locale: ForeignLocale }) {
  const copy = COPY[locale];
  const [cities, provinces] = await Promise.all([getCities(), getProvinces()]);
  const city = cities.find((item) => item.slug === "milano") ?? cities[0];
  const province = provinces.find((item) => item.id === city.provinceId) ?? provinces[0];
  const stations = province ? await getStations({ provinceId: province.id, limit: 1500 }).catch(() => []) : [];
  const statistic = buildCityFuelStatistic(city, "BENZINA", stations);
  const featured = FEATURED.map((slug) => cities.find((item) => item.slug === slug)).filter((item): item is (typeof cities)[number] => Boolean(item));

  return (
    <>
      <Header />
      <HomeExperience
        pageTitle={copy.h1}
        cities={cities}
        provinces={provinces}
        initialCity={city}
        initialProvince={province}
        stations={stations}
        statistic={statistic}
        locale={locale}
      />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 md:px-6" aria-labelledby="how-it-works">
        <div className="grid gap-4 rounded-md border border-ink/10 bg-white p-4 shadow-sm md:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3">
            <h2 id="how-it-works" className="text-2xl font-black text-ink">
              {copy.howTitle}
            </h2>
            {copy.how.map((paragraph) => (
              <p key={paragraph} className="text-ink/70">
                {paragraph}
              </p>
            ))}
          </div>
          <nav className="flex flex-wrap content-start gap-2" aria-label={copy.linksLabel}>
            {featured.map((item) => (
              <Link
                key={item.slug}
                className="rounded-md border border-petrol/20 px-3 py-2 text-sm font-black text-petrol hover:border-petrol/45"
                href={cityFuelPathFor(locale, "BENZINA", item.slug)}
              >
                {copy.cityLink(localizedCityName(locale, item))}
              </Link>
            ))}
            <Link
              className="rounded-md border border-petrol/20 px-3 py-2 text-sm font-black text-petrol hover:border-petrol/45"
              href={LOCALE_ROUTES[locale].fuelIndex}
            >
              {copy.allCities}
            </Link>
          </nav>
        </div>
      </section>
      <Footer locale={locale} />
    </>
  );
}
