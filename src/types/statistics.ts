import type { FuelTypeCode } from "./fuel";

export interface CityFuelStatistic {
  cityId: number;
  cityName: string;
  fuelTypeCode: FuelTypeCode;
  averagePrice: number;
  minimumPrice: number;
  maximumPrice: number;
  stationCount: number;
  updatedAt: string;
}

export interface PriceHistoryPoint {
  date: string;
  averagePrice: number;
  minimumPrice: number;
  maximumPrice: number;
}
