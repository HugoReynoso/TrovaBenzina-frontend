import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeExperience } from "@/features/stations/HomeExperience";
import { getCities } from "@/lib/api/cities";
import { getProvinces } from "@/lib/api/provinces";
import { getStations } from "@/lib/api/stations";
import { buildCityFuelStatistic } from "@/lib/statistics";

export const metadata: Metadata = {
  title: "Prezzi Benzina, Diesel, GPL e Metano Vicino a Te",
  description:
    "Confronta i prezzi carburante vicino a te o per provincia, trova i distributori piu economici sulla mappa e risparmia sul pieno.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "TrovaBenzina - Prezzi carburante vicino a te",
    description: "Mappa dei distributori economici con filtri per provincia, carburante e modalita self o servito.",
    url: "/"
  }
};

export default async function HomePage() {
  const [cities, provinces] = await Promise.all([getCities(), getProvinces()]);
  const city = cities.find((item) => item.slug === "milano") ?? cities[0];
  const province = provinces.find((item) => item.id === city.provinceId) ?? provinces[0];
  const stations = province ? await getStations({ provinceId: province.id, fuelType: "BENZINA", serviceMode: "self" }).catch(() => []) : [];
  const statistic = buildCityFuelStatistic(city, "BENZINA", stations);

  return (
    <>
      <Header />
      <HomeExperience cities={cities} provinces={provinces} initialCity={city} initialProvince={province} stations={stations} statistic={statistic} />
      <Footer />
    </>
  );
}
