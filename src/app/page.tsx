import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeExperience } from "@/features/stations/HomeExperience";
import { getCities } from "@/lib/api/cities";
import { getProvinces } from "@/lib/api/provinces";
import { getPriceHistory } from "@/lib/api/statistics";
import { getStations } from "@/lib/api/stations";
import { buildCityFuelStatistic } from "@/lib/statistics";

export default async function HomePage() {
  const [cities, provinces] = await Promise.all([getCities(), getProvinces()]);
  const city = cities.find((item) => item.slug === "milano") ?? cities[0];
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
