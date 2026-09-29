import { isPriceRecent, latestCommunicationTime, MAX_PLAUSIBLE_PRICE_RATIO, MIN_PLAUSIBLE_PRICE_RATIO } from "@/lib/price";
import type { FuelTypeCode } from "@/types/fuel";
import type { City } from "@/types/location";
import type { Station, StationPrice } from "@/types/station";
import type { CityFuelStatistic } from "@/types/statistics";

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

/**
 * Prezzi usati per media/minimo/massimo: solo quelli recenti (ultimi giorni rispetto all'ultimo
 * aggiornamento dei dati) e non anomali (es. 1,000 o 0,123 €/l). Se il filtro elimina tutto,
 * si torna a usare tutti i prezzi per non mostrare statistiche vuote.
 */
function reliablePrices(stations: Station[], fuelType: FuelTypeCode): Array<{ price: StationPrice; stationId: number }> {
  const all = stations.flatMap((station) =>
    station.prices.filter((price) => price.fuelTypeCode === fuelType && price.price > 0).map((price) => ({ price, stationId: station.id }))
  );
  if (all.length === 0) {
    return all;
  }

  const referenceTime = latestCommunicationTime(stations);
  const recent = all.filter((entry) => isPriceRecent(entry.price, referenceTime));
  const pool = recent.length > 0 ? recent : all;
  if (pool.length < 5) {
    return pool;
  }

  const reference = median(pool.map((entry) => entry.price.price));
  const plausible = pool.filter(
    (entry) => entry.price.price >= reference * MIN_PLAUSIBLE_PRICE_RATIO && entry.price.price <= reference * MAX_PLAUSIBLE_PRICE_RATIO
  );
  return plausible.length > 0 ? plausible : pool;
}

export function buildCityFuelStatistic(city: City, fuelType: FuelTypeCode, stations: Station[]): CityFuelStatistic {
  const prices = reliablePrices(stations, fuelType);
  const values = prices.map((entry) => entry.price.price);
  const latestUpdate = prices
    .map((entry) => entry.price.communicatedAt)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  if (values.length === 0) {
    return {
      cityId: city.id,
      cityName: city.name,
      fuelTypeCode: fuelType,
      averagePrice: 0,
      minimumPrice: 0,
      maximumPrice: 0,
      stationCount: 0,
      updatedAt: ""
    };
  }

  return {
    cityId: city.id,
    cityName: city.name,
    fuelTypeCode: fuelType,
    averagePrice: Number((values.reduce((total, price) => total + price, 0) / values.length).toFixed(3)),
    minimumPrice: Math.min(...values),
    maximumPrice: Math.max(...values),
    stationCount: new Set(prices.map((entry) => entry.stationId)).size,
    updatedAt: latestUpdate ?? ""
  };
}
