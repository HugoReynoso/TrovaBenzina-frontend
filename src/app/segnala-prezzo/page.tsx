import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PriceReportForm } from "@/features/reports/PriceReportForm";
import { getCities } from "@/lib/api/cities";
import { getStations } from "@/lib/api/stations";

export const metadata: Metadata = {
  title: "Segnala Prezzo Benzinaio",
  description: "Invia una segnalazione prezzo per un distributore. Le segnalazioni vengono approvate dall'admin prima della pubblicazione.",
  alternates: { canonical: "/segnala-prezzo" },
  robots: { index: true, follow: true }
};

export default async function ReportPricePage() {
  const cities = await getCities();
  const initialCity = cities.find((city) => city.slug === "milano") ?? cities[0];
  const stations = initialCity ? await getStations({ cityId: initialCity.id, fuelType: "BENZINA", serviceMode: "all" }).catch(() => []) : [];

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-4xl gap-5 px-4 py-6 md:px-6">
        <PriceReportForm cities={cities} initialCity={initialCity} stations={stations} />
      </main>
      <Footer />
    </>
  );
}
