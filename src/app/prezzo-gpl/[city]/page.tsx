import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CitySummary } from "@/features/statistics/CitySummary";
import { PriceHistoryChart } from "@/features/statistics/PriceHistoryChart";
import { StatsCards } from "@/features/statistics/StatsCards";
import { CheapestStations } from "@/features/stations/CheapestStations";
import { getCities, getCityBySlug } from "@/lib/api/cities";
import { getPriceHistory, getCityFuelStatistics } from "@/lib/api/statistics";
import { getStations } from "@/lib/api/stations";
import { sortStationsByPrice } from "@/lib/price";

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const resolvedCity = await getCityBySlug(city);
  return {
    title: `Prezzo GPL ${resolvedCity?.name ?? city} Oggi - Distributori piu Economici`,
    description: `Confronta il prezzo GPL a ${resolvedCity?.name ?? city} e trova i distributori piu convenienti.`,
    alternates: { canonical: `/prezzo-gpl/${city}` }
  };
}

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((city) => ({ city: city.slug }));
}

export default async function GplCityPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const cities = await getCities();
  const city = (await getCityBySlug(citySlug)) ?? cities[0];
  const [stations, statistic, history] = await Promise.all([
    getStations({ cityId: city.id, fuelType: "GPL", serviceMode: "self" }),
    getCityFuelStatistics(city.id, "GPL"),
    getPriceHistory(city.id, "GPL")
  ]);

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <h1 className="text-3xl font-black text-ink">Prezzo GPL a {city.name} oggi</h1>
        <StatsCards statistic={statistic} />
        <CheapestStations stations={sortStationsByPrice(stations, "GPL", "self").slice(0, 10)} fuelType="GPL" serviceMode="self" />
        <CitySummary city={city} statistic={statistic} />
        <PriceHistoryChart points={history} />
      </main>
      <Footer />
    </>
  );
}
