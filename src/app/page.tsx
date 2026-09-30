import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeExperience } from "@/features/stations/HomeExperience";
import { getCities } from "@/lib/api/cities";
import { getProvinces } from "@/lib/api/provinces";
import { getStations } from "@/lib/api/stations";
import { buildCityFuelStatistic } from "@/lib/statistics";
import { homeAlternates } from "@/lib/i18n";
import { provinceCenterCities, toClientStations } from "@/lib/client-data";

export const metadata: Metadata = {
  title: { absolute: "TrovaBenzina | Prezzo benzina oggi e distributori più economici" },
  description:
    "Trova Benzina: confronta il prezzo di benzina, diesel e GPL oggi, trova il distributore più economico vicino a te sulla mappa e controlla la data dell'ultimo prezzo comunicato al MIMIT.",
  alternates: { canonical: "/", languages: homeAlternates() },
  openGraph: {
    title: "TrovaBenzina | Prezzo benzina oggi e distributori più economici",
    description: "Trova Benzina: mappa dei distributori con prezzi di benzina, diesel e GPL, filtri per provincia e modalità self o servito.",
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
      <HomeExperience pageTitle="TrovaBenzina: prezzo benzina oggi e distributori più economici" cities={provinceCenterCities(cities, provinces)} provinces={provinces} initialCity={city} initialProvince={province} stations={toClientStations(stations)} statistic={statistic} />
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
              { href: "/prezzo-benzina/roma", label: "Prezzo benzina Roma" },
              { href: "/prezzo-benzina/torino", label: "Prezzo benzina Torino" },
              { href: "/prezzo-benzina/napoli", label: "Prezzo benzina Napoli" },
              { href: "/prezzo-benzina/bologna", label: "Prezzo benzina Bologna" },
              { href: "/prezzo-benzina/firenze", label: "Prezzo benzina Firenze" },
              { href: "/prezzo-diesel/milano", label: "Prezzo diesel Milano" },
              { href: "/prezzo-gpl/roma", label: "Prezzo GPL Roma" },
              { href: "/prezzi-carburanti", label: "Tutte le città →" }
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
