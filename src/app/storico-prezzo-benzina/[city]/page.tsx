import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PriceHistoryChart } from "@/features/statistics/PriceHistoryChart";
import { getCities, getCityBySlug } from "@/lib/api/cities";
import { getCityFuelStatistics, getPriceHistory } from "@/lib/api/statistics";
import { buildCityFuelStatistic } from "@/lib/statistics";
import { getSeoCities } from "@/lib/seo-cities";

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const resolvedCity = await getCityBySlug(city);
  return {
    title: `Storico Prezzo Benzina ${resolvedCity?.name ?? city}`,
    description: `Consulta lo storico del prezzo benzina a ${resolvedCity?.name ?? city}, con media, minimo e massimo.`,
    alternates: { canonical: `/storico-prezzo-benzina/${city}` }
  };
}

export async function generateStaticParams() {
  const cities = await getCities();
  return getSeoCities(cities).map((city) => ({ city: city.slug }));
}

export default async function HistoryPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const cities = await getCities();
  const city = (await getCityBySlug(citySlug)) ?? cities[0];
  const [history, statistic] = await Promise.all([
    getPriceHistory(city.id, "BENZINA").catch(() => []),
    getCityFuelStatistics(city.id, "BENZINA").catch(() => buildCityFuelStatistic(city, "BENZINA", []))
  ]);

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <h1 className="text-3xl font-black text-ink">Storico prezzo benzina a {city.name}</h1>
        <p className="max-w-3xl text-ink/70">
          Andamento del prezzo benzina calcolato da TrovaBenzina. Stiamo lavorando per rendere lo storico sempre piu completo.
        </p>
        <PriceHistoryChart points={history} fallbackStatistic={statistic} />
      </main>
      <Footer />
    </>
  );
}
