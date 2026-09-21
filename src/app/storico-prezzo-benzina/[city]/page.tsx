import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PriceHistoryChart } from "@/features/statistics/PriceHistoryChart";
import { getCities, getCityBySlug } from "@/lib/api/cities";
import { getPriceHistory } from "@/lib/api/statistics";

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
  return cities.map((city) => ({ city: city.slug }));
}

export default async function HistoryPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const cities = await getCities();
  const city = (await getCityBySlug(citySlug)) ?? cities[0];
  const history = await getPriceHistory(city.id, "BENZINA");

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <h1 className="text-3xl font-black text-ink">Storico prezzo benzina a {city.name}</h1>
        <p className="max-w-3xl text-ink/70">
          Andamento indicativo del prezzo benzina con dati mock separati, pronto per il collegamento agli endpoint storici del backend.
        </p>
        <PriceHistoryChart points={history} />
      </main>
      <Footer />
    </>
  );
}
