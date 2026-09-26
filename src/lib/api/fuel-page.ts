import { buildCityFuelStatistic } from "@/lib/statistics";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { City } from "@/types/location";
import type { Station } from "@/types/station";
import type { CityFuelStatistic, PriceHistoryPoint } from "@/types/statistics";
import { getCityFuelStatistics, getPriceHistory } from "./statistics";
import { getCheapestStations, getNearbyStations, getStations } from "./stations";

interface FuelPageDataOptions {
  limit?: number;
  radiusKm?: number;
  serviceMode?: ServiceMode;
  useCheapest?: boolean;
  useNearby?: boolean;
}

export interface FuelPageData {
  stations: Station[];
  statistic: CityFuelStatistic;
  history: PriceHistoryPoint[];
}

export async function getFuelPageData(city: City, fuelType: FuelTypeCode, options: FuelPageDataOptions = {}): Promise<FuelPageData> {
  const serviceMode = options.serviceMode ?? "self";
  const stationsPromise = options.useNearby
    ? getNearbyStations({
        cityId: city.id,
        city: city.name,
        province: city.provinceName,
        fuelType,
        serviceMode,
        radiusKm: options.radiusKm ?? 10,
        limit: options.limit ?? 50
      })
    : options.useCheapest
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
