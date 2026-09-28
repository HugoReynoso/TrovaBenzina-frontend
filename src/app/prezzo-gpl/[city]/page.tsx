import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FuelCitySeo } from "@/features/seo/FuelCitySeo";
import { CitySummary } from "@/features/statistics/CitySummary";
import { FuelComposition } from "@/features/statistics/FuelComposition";
import { StatsCards } from "@/features/statistics/StatsCards";
import { CheapestStations } from "@/features/stations/CheapestStations";
import { NewsPreview } from "@/features/news/NewsPreview";
import { getCities, getCityBySlug } from "@/lib/api/cities";
import { getFuelPageData } from "@/lib/api/fuel-page";
import { buildCityFuelMetadata } from "@/lib/seo";
import { getSeoCities } from "@/lib/seo-cities";

interface PageProps {
  params: Promise<{ city: string }>;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);

  if (!city) {
    notFound();
  }

  return buildCityFuelMetadata(city, "GPL");
}

export async function generateStaticParams() {
  const cities = await getCities();
  return getSeoCities(cities).map((city) => ({ city: city.slug }));
}

export default async function GplCityPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const cities = await getCities();
  const city = cities.find((item) => item.slug === citySlug);

  if (!city) {
    notFound();
  }

  const { stations, statistic } = await getFuelPageData(city, "GPL", { serviceMode: "served", useCheapest: true, limit: 10 });

  return (
    <>
      <Header />
      <FuelCitySeo city={city} cities={getSeoCities(cities)} fuelType="GPL" stations={stations} statistic={statistic} serviceMode="served" />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <StatsCards statistic={statistic} />
        <CheapestStations stations={stations} fuelType="GPL" serviceMode="served" cityName={city.name} />
        <CitySummary city={city} statistic={statistic} />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_360px] lg:items-start">
          <FuelComposition />
          <NewsPreview vertical />
        </div>
      </main>
      <Footer />
    </>
  );
}
