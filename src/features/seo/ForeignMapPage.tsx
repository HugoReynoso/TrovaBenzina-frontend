import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { MapExperience } from "@/features/map/MapExperience";
import { getCities } from "@/lib/api/cities";
import { getProvinces } from "@/lib/api/provinces";
import { getStations } from "@/lib/api/stations";
import { LOCALE_ROUTES, mapAlternates, openGraphLocale, type Locale } from "@/lib/i18n";
import { defaultOgImage, siteName } from "@/lib/seo";
import { buildCityFuelStatistic } from "@/lib/statistics";

type ForeignLocale = Exclude<Locale, "it">;

const COPY: Record<ForeignLocale, { title: string; description: string }> = {
  en: {
    title: "Fuel Station Map of Italy: Petrol, Diesel and LPG Prices",
    description:
      "Map of fuel stations in Italy with today's petrol, diesel and LPG prices. Filter by province, fuel and self-service or full service, and see the cheapest stations first."
  },
  es: {
    title: "Mapa de gasolineras en Italia: precios de gasolina, diésel y GLP",
    description:
      "Mapa de las gasolineras de Italia con los precios de hoy de la gasolina, el diésel y el GLP. Filtra por provincia, combustible y autoservicio o atendido, y ve primero las más baratas."
  }
};

export function foreignMapMetadata(locale: ForeignLocale): Metadata {
  const copy = COPY[locale];
  const path = LOCALE_ROUTES[locale].map;
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: path, languages: mapAlternates() },
    openGraph: {
      title: `${copy.title} | ${siteName}`,
      description: copy.description,
      url: path,
      type: "website",
      locale: openGraphLocale(locale),
      siteName,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: copy.title }]
    }
  };
}

export async function ForeignMapPage({ locale }: { locale: ForeignLocale }) {
  const [cities, provinces] = await Promise.all([getCities(), getProvinces()]);
  const city = cities.find((item) => item.slug === "milano") ?? cities[0];
  const province = provinces.find((item) => item.id === city.provinceId) ?? provinces[0];
  const stations = province ? await getStations({ provinceId: province.id, limit: 1500 }).catch(() => []) : [];
  const statistic = buildCityFuelStatistic(city, "BENZINA", stations);

  return (
    <>
      <Header />
      <MapExperience
        cities={cities}
        provinces={provinces}
        initialCity={city}
        initialProvince={province}
        stations={stations}
        statistic={statistic}
        locale={locale}
      />
    </>
  );
}
