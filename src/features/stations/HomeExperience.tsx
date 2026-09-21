"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { Accordion } from "@/components/Accordion";
import { CitySelector } from "@/features/filters/CitySelector";
import { FuelSelector } from "@/features/filters/FuelSelector";
import { ServiceModeSelector } from "@/features/filters/ServiceModeSelector";
import { DynamicStationMap } from "@/features/map/DynamicStationMap";
import { BottomSheet } from "@/features/stations/BottomSheet";
import { CheapestStations } from "@/features/stations/CheapestStations";
import { CitySummary } from "@/features/statistics/CitySummary";
import { FuelComposition } from "@/features/statistics/FuelComposition";
import { PriceHistoryChart } from "@/features/statistics/PriceHistoryChart";
import { StatsCards } from "@/features/statistics/StatsCards";
import { NewsPreview } from "@/features/news/NewsPreview";
import { sortStationsByPrice } from "@/lib/price";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { City } from "@/types/location";
import type { Station } from "@/types/station";
import type { CityFuelStatistic, PriceHistoryPoint } from "@/types/statistics";

interface HomeExperienceProps {
  cities: City[];
  initialCity: City;
  stations: Station[];
  statistic: CityFuelStatistic;
  history: PriceHistoryPoint[];
}

export function HomeExperience({ cities, initialCity, stations, statistic, history }: HomeExperienceProps) {
  const [fuelType, setFuelType] = useState<FuelTypeCode>("BENZINA");
  const [serviceMode, setServiceMode] = useState<ServiceMode>("self");
  const [citySlug, setCitySlug] = useState(initialCity.slug);
  const [sheetOpen, setSheetOpen] = useState(false);

  const selectedCity = cities.find((city) => city.slug === citySlug) ?? initialCity;
  const visibleStations = useMemo(
    () => (selectedCity.id === initialCity.id ? stations : []),
    [initialCity.id, selectedCity.id, stations]
  );
  const cheapest = useMemo(
    () => sortStationsByPrice(visibleStations, fuelType, serviceMode).slice(0, 5),
    [visibleStations, fuelType, serviceMode]
  );

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:px-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="grid gap-4">
          <div className="grid gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-black text-petrol">Trova il pieno che fa meno male.</p>
              <h1 className="mt-1 text-2xl font-black leading-tight text-ink md:text-4xl">Prezzo benzina a Milano oggi</h1>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_2fr_1.4fr]">
              <CitySelector cities={cities} value={citySlug} onChange={setCitySlug} />
              <FuelSelector value={fuelType} onChange={setFuelType} />
              <ServiceModeSelector value={serviceMode} onChange={setServiceMode} />
            </div>
          </div>

          {visibleStations.length > 0 ? (
            <DynamicStationMap
              city={selectedCity}
              stations={visibleStations}
              fuelType={fuelType}
              serviceMode={serviceMode}
              averagePrice={statistic.averagePrice}
            />
          ) : (
            <div className="grid h-[52vh] min-h-[360px] place-items-center rounded-md border border-dashed border-ink/20 bg-white text-center shadow-sm">
              <div>
                <p className="text-lg font-black text-ink">Nessun distributore trovato con questi filtri.</p>
                <button className="mt-3 rounded-md bg-petrol px-4 py-2 font-black text-white" type="button" onClick={() => setFuelType("BENZINA")}>
                  Rimuovi filtri
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-amber px-5 py-4 text-base font-black text-ink shadow-soft md:hidden"
            onClick={() => setSheetOpen(true)}
          >
            <Trophy size={20} aria-hidden="true" />
            Piu economici
          </button>

          <Link
            className="inline-flex items-center justify-center rounded-md border border-petrol/25 bg-white px-5 py-3 text-sm font-black text-petrol shadow-sm md:hidden"
            href="/segnala-prezzo"
          >
            Segnala un prezzo
          </Link>
        </div>

        <aside className="hidden grid-cols-1 gap-4 lg:grid">
          <StatsCards statistic={statistic} compact />
          <CheapestStations stations={cheapest} fuelType={fuelType} serviceMode={serviceMode} />
        </aside>
      </section>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 pb-8 md:px-6">
        <div className="grid gap-5 lg:hidden">
          <StatsCards statistic={statistic} />
        </div>

        <CitySummary city={selectedCity} statistic={statistic} />

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.9fr]">
          <Accordion title="Storico prezzi" defaultOpen>
            <PriceHistoryChart points={history} />
          </Accordion>
          <Accordion title="Accise e composizione prezzo" defaultOpen>
            <FuelComposition />
          </Accordion>
        </div>

        <NewsPreview />
      </main>

      <BottomSheet title="Piu economici" open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <CheapestStations stations={cheapest} fuelType={fuelType} serviceMode={serviceMode} />
      </BottomSheet>
    </>
  );
}
