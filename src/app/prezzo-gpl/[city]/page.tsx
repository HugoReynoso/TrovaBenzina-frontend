import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CitySummary } from "@/features/statistics/CitySummary";
import { FuelComposition } from "@/features/statistics/FuelComposition";
import { StatsCards } from "@/features/statistics/StatsCards";
import { CheapestStations } from "@/features/stations/CheapestStations";
import { NewsPreview } from "@/features/news/NewsPreview";
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
    title: `Prezzo GPL ${resolvedCity?.name ?? city} Oggi - Distributori piu Economici`,
    description: `Prezzo GPL a ${resolvedCity?.name ?? city} oggi: confronta distributori economici e prezzi aggiornati sulla mappa.`,
    alternates: { canonical: `/prezzo-gpl/${city}` },
    openGraph: {
      title: `Prezzo GPL a ${resolvedCity?.name ?? city} oggi`,
      description: `Mappa distributori e prezzi GPL aggiornati per ${resolvedCity?.name ?? city}.`,
      url: `/prezzo-gpl/${city}`,
      type: "website"
    }
  };
}

export async function generateStaticParams() {
  const cities = await getCities();
  return getSeoCities(cities).map((city) => ({ city: city.slug }));
}

export default async function GplCityPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const cities = await getCities();
  const city = (await getCityBySlug(citySlug)) ?? cities[0];
  const { stations, statistic } = await getFuelPageData(city, "GPL", { serviceMode: "served", useCheapest: true, limit: 10 });

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <h1 className="text-3xl font-black text-ink">Prezzo GPL a {city.name} oggi</h1>
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
