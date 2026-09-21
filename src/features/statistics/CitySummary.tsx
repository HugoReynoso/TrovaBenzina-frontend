import type { City } from "@/types/location";
import type { CityFuelStatistic } from "@/types/statistics";
import { formatEuro } from "@/lib/price";

interface CitySummaryProps {
  city: City;
  statistic: CityFuelStatistic;
}

export function CitySummary({ city, statistic }: CitySummaryProps) {
  return (
    <section className="rounded-md border border-ink/10 bg-white p-4 leading-relaxed text-ink/72 shadow-sm">
      <h2 className="text-xl font-black text-ink">Prezzi carburante a {city.name}</h2>
      <p className="mt-2">
        A {city.name}, in provincia di {city.provinceName}, il prezzo medio rilevato e {formatEuro(statistic.averagePrice)}.
        Il minimo e {formatEuro(statistic.minimumPrice)}, il massimo e {formatEuro(statistic.maximumPrice)} su{" "}
        {statistic.stationCount} distributori nel dataset corrente.
      </p>
      <p className="mt-2 text-sm">
        I dati sono mock separati in attesa del backend Spring Boot e verranno sostituiti dagli endpoint MIMIT del progetto.
      </p>
    </section>
  );
}
