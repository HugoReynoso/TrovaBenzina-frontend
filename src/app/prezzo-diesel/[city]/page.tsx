import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CitySummary } from "@/features/statistics/CitySummary";
import { PriceHistoryChart } from "@/features/statistics/PriceHistoryChart";
import { StatsCards } from "@/features/statistics/StatsCards";
import { CheapestStations } from "@/features/stations/CheapestStations";
import { getCities, getCityBySlug } from "@/lib/api/cities";
import { getFuelPageData } from "@/lib/api/fuel-page";
import { getSeoCities } from "@/lib/seo-cities";

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const resolvedCity = await getCityBySlug(city);
  return {
    title: `Prezzo Diesel ${resolvedCity?.name ?? city} Oggi - Distributori piu Economici`,
    description: `Confronta il prezzo diesel a ${resolvedCity?.name ?? city} e trova i distributori piu convenienti.`,
    alternates: { canonical: `/prezzo-diesel/${city}` }
  };
}

export async function generateStaticParams() {
  const cities = await getCities();
  return getSeoCities(cities).map((city) => ({ city: city.slug }));
}

export default async function DieselCityPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const cities = await getCities();
  const city = (await getCityBySlug(citySlug)) ?? cities[0];
  const { stations, statistic, history } = await getFuelPageData(city, "DIESEL", { serviceMode: "self", useCheapest: true, limit: 10 });

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <h1 className="text-3xl font-black text-ink">Prezzo diesel a {city.name} oggi</h1>
        <StatsCards statistic={statistic} />
        <CheapestStations stations={stations} fuelType="DIESEL" serviceMode="self" cityName={city.name} />
        <CitySummary city={city} statistic={statistic} />
        <PriceHistoryChart points={history} fallbackStatistic={statistic} />
      </main>
      <Footer />
    </>
  );
}
