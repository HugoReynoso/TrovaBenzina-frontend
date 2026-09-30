import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PriceHistoryChart } from "@/features/statistics/PriceHistoryChart";
import { getCities, getCityBySlug } from "@/lib/api/cities";
import { getCityFuelStatistics, getPriceHistory } from "@/lib/api/statistics";
import { breadcrumbJsonLd, defaultOgImage, siteName } from "@/lib/seo";
import { buildCityFuelStatistic } from "@/lib/statistics";
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

  return {
    title: `Storico Prezzo Benzina ${city.name}`,
    description: `Consulta lo storico del prezzo benzina a ${city.name}, con media, minimo e massimo quando disponibili.`,
    alternates: { canonical: `/storico-prezzo-benzina/${city.slug}` },
    // Fuori dall'indice finche' lo storico non ha dati sufficienti e un testo nell'HTML:
    // 110 pagine quasi vuote abbasserebbero la qualita' percepita dell'intero sito.
    robots: { index: false, follow: true },
    openGraph: {
      title: `Storico Prezzo Benzina ${city.name} | ${siteName}`,
      description: `Consulta lo storico del prezzo benzina a ${city.name}, con media, minimo e massimo quando disponibili.`,
      url: `/storico-prezzo-benzina/${city.slug}`,
      type: "website",
      locale: "it_IT",
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: `${siteName} - storico benzina ${city.name}` }]
    },
    twitter: {
      card: "summary_large_image",
      title: `Storico Prezzo Benzina ${city.name} | ${siteName}`,
      description: `Consulta lo storico del prezzo benzina a ${city.name}, con media, minimo e massimo quando disponibili.`,
      images: [defaultOgImage]
    }
  };
}

export async function generateStaticParams() {
  const cities = await getCities();
  return getSeoCities(cities).map((city) => ({ city: city.slug }));
}

export default async function HistoryPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const cities = await getCities();
  const city = cities.find((item) => item.slug === citySlug);

  if (!city) {
    notFound();
  }

  const [history, statistic] = await Promise.all([
    getPriceHistory(city.id, "BENZINA").catch(() => []),
    getCityFuelStatistics(city.id, "BENZINA").catch(() => buildCityFuelStatistic(city, "BENZINA", []))
  ]);
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Storico prezzo benzina", path: `/storico-prezzo-benzina/${city.slug}` },
    { name: city.name, path: `/storico-prezzo-benzina/${city.slug}` }
  ]);

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <h1 className="text-3xl font-black text-ink">Storico prezzo benzina a {city.name}</h1>
        <p className="max-w-3xl text-ink/70">
          Andamento del prezzo benzina calcolato da TrovaBenzina. Stiamo lavorando per rendere lo storico sempre più completo.
        </p>
        <PriceHistoryChart points={history} fallbackStatistic={statistic} />
      </main>
      <Footer />
    </>
  );
}
