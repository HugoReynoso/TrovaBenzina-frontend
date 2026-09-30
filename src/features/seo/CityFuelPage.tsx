import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FuelCitySeo } from "@/features/seo/FuelCitySeo";
import { CitySummary } from "@/features/statistics/CitySummary";
import { FuelComposition } from "@/features/statistics/FuelComposition";
import { StatsCards } from "@/features/statistics/StatsCards";
import { CheapestStations } from "@/features/stations/CheapestStations";
import { HomeExperience } from "@/features/stations/HomeExperience";
import { NewsPreview } from "@/features/news/NewsPreview";
import { getCities, getCityBySlug } from "@/lib/api/cities";
import { getFuelPageData } from "@/lib/api/fuel-page";
import { getProvinces } from "@/lib/api/provinces";
import { getStations } from "@/lib/api/stations";
import { isTranslatedCity, localizedCityName, type Locale, type LocalizedFuel } from "@/lib/i18n";
import { filterReliableStations, latestCommunicationTime } from "@/lib/price";
import { buildCityFuelMetadata, fuelSeo } from "@/lib/seo";
import { getSeoCities } from "@/lib/seo-cities";
import { buildCityFuelStatistic } from "@/lib/statistics";
import { provinceCenterCities, toClientStations } from "@/lib/client-data";

/**
 * Pagine "prezzo [carburante] [citta]" condivise tra italiano, inglese e spagnolo.
 * In italiano esistono per tutti i capoluoghi, in inglese e spagnolo per i capoluoghi di regione.
 */
export async function cityFuelStaticParams(locale: Locale): Promise<Array<{ city: string }>> {
  const cities = getSeoCities(await getCities());
  const pageCities = locale === "it" ? cities : cities.filter((city) => isTranslatedCity(city.slug));
  return pageCities.map((city) => ({ city: city.slug }));
}

export async function cityFuelMetadata(locale: Locale, fuelType: LocalizedFuel, citySlug: string): Promise<Metadata> {
  const city = await getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }
  return buildCityFuelMetadata(city, fuelType, locale);
}

export async function CityFuelPage({ locale, fuelType, citySlug }: { locale: Locale; fuelType: LocalizedFuel; citySlug: string }) {
  const serviceMode = fuelSeo[fuelType].serviceMode;

  if (fuelType === "BENZINA") {
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
        <FuelCitySeo
          city={city}
          cities={getSeoCities(cities)}
          fuelType="BENZINA"
          stations={stations}
          statistic={statistic}
          serviceMode={serviceMode}
          locale={locale}
        />
        <HomeExperience
          cities={provinceCenterCities(cities, provinces)}
          provinces={provinces}
          initialCity={city}
          initialProvince={province}
          stations={toClientStations(stations)}
          statistic={statistic}
          showTitle={false}
          locale={locale}
        />
        <Footer locale={locale} />
      </>
    );
  }

  const cities = await getCities();
  const city = cities.find((item) => item.slug === citySlug);
  if (!city) {
    notFound();
  }

  const { stations, statistic } = await getFuelPageData(city, fuelType, { serviceMode, useCheapest: true, limit: 10 });
  // Nella classifica solo prezzi recenti e non anomali (come nelle altre pagine).
  const reliableStations = filterReliableStations(stations, fuelType, serviceMode, latestCommunicationTime(stations));

  return (
    <>
      <Header />
      <FuelCitySeo
        city={city}
        cities={getSeoCities(cities)}
        fuelType={fuelType}
        stations={stations}
        statistic={statistic}
        serviceMode={serviceMode}
        locale={locale}
      />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-6">
        <StatsCards statistic={statistic} locale={locale} />
        <CheapestStations
          stations={reliableStations}
          fuelType={fuelType}
          serviceMode={serviceMode}
          cityName={localizedCityName(locale, city)}
          locale={locale}
        />
        <CitySummary city={city} statistic={statistic} locale={locale} />
        {locale === "it" ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_360px] lg:items-start">
            <FuelComposition />
            <NewsPreview vertical />
          </div>
        ) : null}
      </main>
      <Footer locale={locale} />
    </>
  );
}
