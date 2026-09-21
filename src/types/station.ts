import type { FuelTypeCode } from "./fuel";

export interface StationPrice {
  fuelTypeCode: FuelTypeCode;
  fuelTypeName: string;
  price: number;
  selfService: boolean;
  communicatedAt: string;
}

export interface Station {
  id: number;
  mimitId: string;
  name: string;
  brand: string;
  address: string;
  latitude: number;
  longitude: number;
  cityId: number;
  cityName: string;
  provinceName: string;
  regionName: string;
  distanceKm?: number;
  prices: StationPrice[];
}
