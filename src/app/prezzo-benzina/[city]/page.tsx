import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeExperience } from "@/features/stations/HomeExperience";
import { getCities, getCityBySlug } from "@/lib/api/cities";
import { getFuelPageData } from "@/lib/api/fuel-page";
import { getSeoCities } from "@/lib/seo-cities";

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  const cityName = city?.name ?? "Milano";

  return {
    title: `Prezzo Benzina ${cityName} Oggi - Distributori piu Economici`,
    description: `Consulta i prezzi della benzina a ${cityName}, trova i distributori piu economici sulla mappa e confronta benzina, diesel e GPL.`,
    alternates: { canonical: `/prezzo-benzina/${citySlug}` },
    openGraph: {
      title: `Prezzo benzina a ${cityName} oggi`,
      description: `Mappa e prezzi benzina aggiornati per ${cityName}.`
    }
  };
}

export async function generateStaticParams() {
  const cities = await getCities();
  return getSeoCities(cities).map((city) => ({ city: city.slug }));
}

export default async function BenzinaCityPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const cities = await getCities();
  const city = (await getCityBySlug(citySlug)) ?? cities[0];
  const { stations, statistic, history } = await getFuelPageData(city, "BENZINA", { serviceMode: "self" });

  return (
    <>
      <Header />
      <HomeExperience cities={cities} initialCity={city} stations={stations} statistic={statistic} history={history} />
      <Footer />
    </>
  );
}
