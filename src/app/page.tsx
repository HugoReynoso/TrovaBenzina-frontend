import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeExperience } from "@/features/stations/HomeExperience";
import { getCities, getCityBySlug } from "@/lib/api/cities";
import { getPriceHistory, getCityFuelStatistics } from "@/lib/api/statistics";
import { getStations } from "@/lib/api/stations";

export default async function HomePage() {
  const cities = await getCities();
  const city = (await getCityBySlug("milano")) ?? cities[0];
  const [stations, statistic, history] = await Promise.all([
    getStations({ cityId: city.id, fuelType: "BENZINA", serviceMode: "self" }),
    getCityFuelStatistics(city.id, "BENZINA"),
    getPriceHistory(city.id, "BENZINA")
  ]);

  return (
    <>
      <Header />
      <HomeExperience cities={cities} initialCity={city} stations={stations} statistic={statistic} history={history} />
      <Footer />
    </>
  );
}
