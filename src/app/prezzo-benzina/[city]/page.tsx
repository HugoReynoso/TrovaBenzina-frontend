import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeExperience } from "@/features/stations/HomeExperience";
import { getCities, getCityBySlug } from "@/lib/api/cities";
import { getProvinces } from "@/lib/api/provinces";
import { getStations } from "@/lib/api/stations";
import { buildCityFuelStatistic } from "@/lib/statistics";
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
    description: `Prezzo benzina a ${cityName} oggi: confronta distributori economici, self service e prezzi carburante aggiornati sulla mappa.`,
    alternates: { canonical: `/prezzo-benzina/${citySlug}` },
    openGraph: {
      title: `Prezzo benzina a ${cityName} oggi`,
      description: `Mappa distributori e prezzi benzina aggiornati per ${cityName}.`,
      url: `/prezzo-benzina/${citySlug}`,
      type: "website"
    }
  };
}

export async function generateStaticParams() {
  const cities = await getCities();
  return getSeoCities(cities).map((city) => ({ city: city.slug }));
}

export default async function BenzinaCityPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const [cities, provinces] = await Promise.all([getCities(), getProvinces()]);
  const city = cities.find((item) => item.slug === citySlug) ?? cities[0];
  const province = provinces.find((item) => item.id === city.provinceId) ?? provinces[0];
  const stations = province ? await getStations({ provinceId: province.id, limit: 1500 }).catch(() => []) : [];
  const statistic = buildCityFuelStatistic(city, "BENZINA", stations);

  return (
    <>
      <Header />
      <HomeExperience cities={cities} provinces={provinces} initialCity={city} initialProvince={province} stations={stations} statistic={statistic} />
      <Footer />
    </>
  );
}
