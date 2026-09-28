import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { MapExperience } from "@/features/map/MapExperience";
import { getCities } from "@/lib/api/cities";
import { getProvinces } from "@/lib/api/provinces";
import { getStations } from "@/lib/api/stations";
import { buildCityFuelStatistic } from "@/lib/statistics";

export const metadata: Metadata = {
  title: "Mappa distributori carburante",
  description:
    "Consulta la mappa distributori TrovaBenzina con filtri per provincia, carburante e modalita prezzo. Lista completa ordinata dal prezzo piu economico.",
  alternates: { canonical: "/mappa" },
  openGraph: {
    title: "Mappa distributori carburante | TrovaBenzina",
    description: "Mappa carburanti con filtri e lista completa dei distributori ordinati per prezzo.",
    url: "/mappa",
    type: "website"
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
      <MapExperience cities={cities} provinces={provinces} initialCity={city} initialProvince={province} stations={stations} statistic={statistic} />
    </>
  );
}
