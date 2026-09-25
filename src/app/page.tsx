import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeExperience } from "@/features/stations/HomeExperience";
import { getCities } from "@/lib/api/cities";
import { getFuelPageData } from "@/lib/api/fuel-page";

export default async function HomePage() {
  const cities = await getCities();
  const city = cities.find((item) => item.slug === "milano") ?? cities[0];
  const { stations, statistic, history } = await getFuelPageData(city, "BENZINA", { serviceMode: "self", useNearby: true });

  return (
    <>
      <Header />
      <HomeExperience cities={cities} initialCity={city} stations={stations} statistic={statistic} history={history} />
      <Footer />
    </>
  );
}
