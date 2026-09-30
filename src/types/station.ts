import type { FuelTypeCode } from "./fuel";

export interface StationPrice {
  fuelTypeCode: FuelTypeCode;
  /** Assente nei dati passati alle pagine interattive (si usa il nome tradotto). */
  fuelTypeName?: string;
  price: number;
  selfService: boolean;
  communicatedAt: string;
}

export interface Station {
  id: number;
  /** Assente nei dati passati alle pagine interattive. */
  mimitId?: string;
  name: string;
  brand: string;
  address: string;
  latitude: number;
  longitude: number;
  cityId: number;
  cityName: string;
  provinceName: string;
  /** Assente nei dati passati alle pagine interattive. */
  regionName?: string;
  distanceKm?: number;
  prices: StationPrice[];
}
