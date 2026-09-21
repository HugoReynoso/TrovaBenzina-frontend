import { mockHistory, mockStatistics } from "@/mocks/statistics";
import type { FuelTypeCode } from "@/types/fuel";
import type { CityFuelStatistic, PriceHistoryPoint } from "@/types/statistics";
import { apiGet } from "./client";

export async function getCityFuelStatistics(cityId: number, fuelType: FuelTypeCode): Promise<CityFuelStatistic> {
  try {
    return await apiGet<CityFuelStatistic>(`/api/cities/${cityId}/fuel-statistics?fuelType=${fuelType}`);
  } catch {
    return mockStatistics.find((item) => item.cityId === cityId && item.fuelTypeCode === fuelType) ?? mockStatistics[0];
  }
}

export async function getPriceHistory(cityId: number, fuelType: FuelTypeCode): Promise<PriceHistoryPoint[]> {
  try {
    return await apiGet<PriceHistoryPoint[]>(`/api/cities/${cityId}/fuel-statistics/history?fuelType=${fuelType}`);
  } catch {
    return mockHistory[`${cityId}-${fuelType}`] ?? [];
  }
}
