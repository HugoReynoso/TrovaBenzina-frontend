import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { MapExperience } from "@/features/map/MapExperience";
import { getCities } from "@/lib/api/cities";
import { getProvinces } from "@/lib/api/provinces";
import { getStations } from "@/lib/api/stations";
import { buildCityFuelStatistic } from "@/lib/statistics";
import { mapAlternates } from "@/lib/i18n";
import { defaultOgImage, siteName } from "@/lib/seo";
import { provinceCenterCities, toClientStations } from "@/lib/client-data";

export const metadata: Metadata = {
  title: "Mappa distributori benzina e prezzi oggi",
  description:
    "Mappa dei distributori di benzina, diesel, GPL e metano con i prezzi di oggi: filtra per provincia, marchio e self o servito e trova il più economico vicino a te.",
  alternates: { canonical: "/mappa", languages: mapAlternates() },
  openGraph: {
    title: `Mappa distributori benzina e prezzi oggi | ${siteName}`,
    description: "Mappa dei distributori con i prezzi di oggi, filtri per provincia e marchio e lista ordinata dal più economico.",
    url: "/mappa",
    type: "website",
    locale: "it_IT",
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: `${siteName} - mappa distributori carburante` }]
  },
  twitter: {
    card: "summary_large_image",
    title: `Mappa distributori benzina e prezzi oggi | ${siteName}`,
    images: [defaultOgImage]
  }
};

export default async function MapPage() {
  const [cities, provinces] = await Promise.all([getCities(), getProvinces()]);
  const city = cities.find((item) => item.slug === "milano") ?? cities[0];
  const province = provinces.find((item) => item.id === city.provinceId) ?? provinces[0];
  const stations = province ? await getStations({ provinceId: province.id, limit: 1500 }).catch(() => []) : [];
  const statistic = buildCityFuelStatistic(city, "BENZINA", stations);

  return (
    <>
      <Header />
      <MapExperience cities={provinceCenterCities(cities, provinces)} provinces={provinces} initialCity={city} initialProvince={province} stations={toClientStations(stations)} statistic={statistic} />
    </>
  );
}
