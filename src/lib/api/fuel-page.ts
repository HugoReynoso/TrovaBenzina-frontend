import { buildCityFuelStatistic } from "@/lib/statistics";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { City } from "@/types/location";
import type { Station } from "@/types/station";
import type { CityFuelStatistic, PriceHistoryPoint } from "@/types/statistics";
import { getCityFuelStatistics, getPriceHistory } from "./statistics";
import { getCheapestStations, getStations } from "./stations";

interface FuelPageDataOptions {
  limit?: number;
  serviceMode?: ServiceMode;
  useCheapest?: boolean;
}

export interface FuelPageData {
  stations: Station[];
  statistic: CityFuelStatistic;
  history: PriceHistoryPoint[];
}

export async function getFuelPageData(city: City, fuelType: FuelTypeCode, options: FuelPageDataOptions = {}): Promise<FuelPageData> {
  const serviceMode = options.serviceMode ?? "self";
  const stationsPromise = options.useCheapest
    ? getCheapestStations(city.id, fuelType, options.limit ?? 10, serviceMode)
    : getStations({ cityId: city.id, fuelType, serviceMode });

  const [stationsResult, statisticResult, historyResult] = await Promise.allSettled([
    stationsPromise,
    getCityFuelStatistics(city.id, fuelType),
    getPriceHistory(city.id, fuelType)
  ]);

  const stations = stationsResult.status === "fulfilled" ? stationsResult.value : [];

  return {
    stations,
    statistic: statisticResult.status === "fulfilled" ? statisticResult.value : buildCityFuelStatistic(city, fuelType, stations),
    history: historyResult.status === "fulfilled" ? historyResult.value : []
  };
}
