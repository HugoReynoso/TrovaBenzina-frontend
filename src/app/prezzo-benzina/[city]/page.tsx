import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FuelCitySeo } from "@/features/seo/FuelCitySeo";
import { HomeExperience } from "@/features/stations/HomeExperience";
import { getCities, getCityBySlug } from "@/lib/api/cities";
import { getProvinces } from "@/lib/api/provinces";
import { getStations } from "@/lib/api/stations";
import { buildCityFuelMetadata } from "@/lib/seo";
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

  return buildCityFuelMetadata(city, "BENZINA");
}

export async function generateStaticParams() {
  const cities = await getCities();
  return getSeoCities(cities).map((city) => ({ city: city.slug }));
}

export default async function BenzinaCityPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const [cities, provinces] = await Promise.all([getCities(), getProvinces()]);
  const city = cities.find((item) => item.slug === citySlug);

  if (!city) {
    notFound();
  }

  const province = provinces.find((item) => item.id === city.provinceId) ?? provinces[0];
  const stations = province ? await getStations({ provinceId: province.id, limit: 1500 }).catch(() => []) : [];
  const statistic = buildCityFuelStatistic(city, "BENZINA", stations);

  return (
    <>
      <Header />
      <FuelCitySeo city={city} cities={getSeoCities(cities)} fuelType="BENZINA" stations={stations} statistic={statistic} serviceMode="self" />
      <HomeExperience
        cities={cities}
        provinces={provinces}
        initialCity={city}
        initialProvince={province}
        stations={stations}
        statistic={statistic}
        showTitle={false}
      />
      <Footer />
    </>
  );
}
