import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeExperience } from "@/features/stations/HomeExperience";
import { getCities, getCityBySlug } from "@/lib/api/cities";
import { getProvinces } from "@/lib/api/provinces";
import { getPriceHistory } from "@/lib/api/statistics";
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
  const [cities, provinces] = await Promise.all([getCities(), getProvinces()]);
  const city = cities.find((item) => item.slug === citySlug) ?? cities[0];
  const province = provinces.find((item) => item.id === city.provinceId) ?? provinces[0];
  const stations = province ? await getStations({ provinceId: province.id, fuelType: "BENZINA", serviceMode: "self" }).catch(() => []) : [];
  const statistic = buildCityFuelStatistic(city, "BENZINA", stations);
  const history = await getPriceHistory(city.id, "BENZINA").catch(() => []);

  return (
    <>
      <Header />
      <HomeExperience cities={cities} provinces={provinces} initialCity={city} initialProvince={province} stations={stations} statistic={statistic} history={history} />
      <Footer />
    </>
  );
}
