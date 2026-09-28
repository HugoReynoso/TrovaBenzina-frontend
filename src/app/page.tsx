import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeExperience } from "@/features/stations/HomeExperience";
import { getCities } from "@/lib/api/cities";
import { getProvinces } from "@/lib/api/provinces";
import { getStations } from "@/lib/api/stations";
import { buildCityFuelStatistic } from "@/lib/statistics";

export const metadata: Metadata = {
  title: "Prezzi benzina, diesel e GPL vicino a te",
  description:
    "Confronta i prezzi carburante per provincia, trova distributori convenienti sulla mappa e consulta le ultime comunicazioni prezzo disponibili.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "TrovaBenzina - Prezzi benzina, diesel e GPL in Italia",
    description: "Mappa dei distributori con filtri per provincia, carburante e modalita self o servito.",
    url: "/"
  }
};

export default async function HomePage() {
  const [cities, provinces] = await Promise.all([getCities(), getProvinces()]);
  const city = cities.find((item) => item.slug === "milano") ?? cities[0];
  const province = provinces.find((item) => item.id === city.provinceId) ?? provinces[0];
  const stations = province ? await getStations({ provinceId: province.id, limit: 1500 }).catch(() => []) : [];
  const statistic = buildCityFuelStatistic(city, "BENZINA", stations);

  return (
    <>
      <Header />
      <HomeExperience cities={cities} provinces={provinces} initialCity={city} initialProvince={province} stations={stations} statistic={statistic} />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 md:px-6" aria-labelledby="come-funziona">
        <div className="grid gap-4 rounded-md border border-ink/10 bg-white p-4 shadow-sm md:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3">
            <h2 id="come-funziona" className="text-2xl font-black text-ink">
              Confronta prezzi carburante con dati disponibili MIMIT
            </h2>
            <p className="text-ink/70">
              TrovaBenzina aiuta a confrontare prezzi di benzina, diesel e GPL per provincia, con mappa, filtri self-service o servito e data di
              comunicazione del prezzo quando disponibile. Le informazioni possono non essere in tempo reale e vanno lette come comunicazioni disponibili.
            </p>
          </div>
          <nav className="flex flex-wrap content-start gap-2" aria-label="Pagine prezzi principali">
            {[
              { href: "/prezzo-benzina/milano", label: "Prezzo benzina Milano" },
              { href: "/prezzo-diesel/milano", label: "Prezzo diesel Milano" },
              { href: "/prezzo-gpl/milano", label: "Prezzo GPL Milano" },
              { href: "/prezzo-benzina/roma", label: "Prezzo benzina Roma" }
            ].map((link) => (
              <Link key={link.href} className="rounded-md border border-petrol/20 px-3 py-2 text-sm font-black text-petrol hover:border-petrol/45" href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <Footer />
    </>
  );
}
