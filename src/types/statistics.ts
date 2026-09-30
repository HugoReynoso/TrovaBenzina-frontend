import type { FuelTypeCode } from "./fuel";

export interface CityFuelStatistic {
  cityId: number;
  cityName: string;
  fuelTypeCode: FuelTypeCode;
  averagePrice: number;
  /** Prezzo mediano: meno sensibile ai pochi distributori molto cari (autostrade, servito). */
  medianPrice?: number;
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
