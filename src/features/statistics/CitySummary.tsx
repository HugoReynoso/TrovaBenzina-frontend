import type { City } from "@/types/location";
import type { CityFuelStatistic } from "@/types/statistics";
import { formatEuro } from "@/lib/price";

interface CitySummaryProps {
  city: City;
  statistic: CityFuelStatistic;
  provinceName?: string;
}

export function CitySummary({ city, statistic, provinceName }: CitySummaryProps) {
  const areaName = provinceName ?? city.name;

  return (
    <section className="rounded-md border border-ink/10 bg-white p-4 leading-relaxed text-ink/72 shadow-sm">
      <h2 className="text-xl font-black text-ink">Prezzi carburante in provincia di {areaName}</h2>
      <p className="mt-2">
        Nell&apos;area di {areaName}, il prezzo medio rilevato e {formatEuro(statistic.averagePrice)}.
        Il minimo e {formatEuro(statistic.minimumPrice)}, il massimo e {formatEuro(statistic.maximumPrice)} su{" "}
        {statistic.stationCount} distributori nel dataset corrente.
      </p>
      <p className="mt-2 text-sm">
        I dati vengono aggiornati da TrovaBenzina in base alle rilevazioni disponibili.
      </p>
    </section>
  );
}
