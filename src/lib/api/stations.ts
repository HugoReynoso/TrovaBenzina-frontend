import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { Station } from "@/types/station";
import { apiGet } from "./client";

interface StationQuery {
  cityId: number;
  fuelType: FuelTypeCode;
  serviceMode?: ServiceMode;
  recentOnly?: boolean;
}

function serviceModeToParam(serviceMode?: ServiceMode): string {
  if (!serviceMode || serviceMode === "all") {
    return "";
  }

  return `&selfService=${serviceMode === "self"}`;
}

export async function getStations(query: StationQuery, init?: RequestInit): Promise<Station[]> {
  return apiGet<Station[]>(`/api/stations?cityId=${query.cityId}&fuelType=${query.fuelType}${serviceModeToParam(query.serviceMode)}`, init);
}

export async function getCheapestStations(
  cityId: number,
  fuelType: FuelTypeCode,
  limit = 10,
  serviceMode: ServiceMode = "self",
  init?: RequestInit
): Promise<Station[]> {
  return apiGet<Station[]>(`/api/stations/cheapest?cityId=${cityId}&fuelType=${fuelType}&limit=${limit}${serviceModeToParam(serviceMode)}`, init);
}

export async function getStation(id: number, init?: RequestInit): Promise<Station | undefined> {
  return apiGet<Station>(`/api/stations/${id}`, init);
}
