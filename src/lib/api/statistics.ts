import type { FuelTypeCode } from "@/types/fuel";
import type { CityFuelStatistic, PriceHistoryPoint } from "@/types/statistics";
import { apiGet } from "./client";

export async function getCityFuelStatistics(cityId: number, fuelType: FuelTypeCode): Promise<CityFuelStatistic> {
  return apiGet<CityFuelStatistic>(`/api/cities/${cityId}/fuel-statistics?fuelType=${fuelType}`);
}

export async function getPriceHistory(
  cityId: number,
  fuelType: FuelTypeCode,
  range?: { from?: string; to?: string }
): Promise<PriceHistoryPoint[]> {
  const params = new URLSearchParams({ fuelType });

  if (range?.from) {
    params.set("from", range.from);
  }

  if (range?.to) {
    params.set("to", range.to);
  }

  return apiGet<PriceHistoryPoint[]>(`/api/cities/${cityId}/fuel-statistics/history?${params.toString()}`);
}
