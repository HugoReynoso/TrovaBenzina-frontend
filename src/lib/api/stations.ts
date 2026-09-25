import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { Station } from "@/types/station";
import { apiGet } from "./client";

interface StationQuery {
  cityId: number;
  fuelType: FuelTypeCode;
  serviceMode?: ServiceMode;
  recentOnly?: boolean;
}

type NearbyStationQuery =
  | {
      cityId: number;
      lat?: never;
      lng?: never;
      radiusKm?: number;
      fuelType?: FuelTypeCode;
      serviceMode?: ServiceMode;
      limit?: number;
    }
  | {
      cityId?: never;
      lat: number;
      lng: number;
      radiusKm?: number;
      fuelType?: FuelTypeCode;
      serviceMode?: ServiceMode;
      limit?: number;
    };

function serviceModeToParam(serviceMode?: ServiceMode): string {
  if (!serviceMode || serviceMode === "all") {
    return "";
  }

  return `&selfService=${serviceMode === "self"}`;
}

function appendOptionalStationParams(params: URLSearchParams, query: { fuelType?: FuelTypeCode; serviceMode?: ServiceMode; limit?: number; radiusKm?: number }) {
  if (query.fuelType) {
    params.set("fuelType", query.fuelType);
  }

  if (query.serviceMode && query.serviceMode !== "all") {
    params.set("selfService", String(query.serviceMode === "self"));
  }

  if (query.radiusKm) {
    params.set("radiusKm", String(query.radiusKm));
  }

  if (query.limit) {
    params.set("limit", String(query.limit));
  }
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

export async function getNearbyStations(query: NearbyStationQuery, init?: RequestInit): Promise<Station[]> {
  const params = new URLSearchParams();

  if ("cityId" in query && query.cityId) {
    params.set("cityId", String(query.cityId));
  } else if ("lat" in query && "lng" in query) {
    params.set("lat", String(query.lat));
    params.set("lng", String(query.lng));
  }

  appendOptionalStationParams(params, query);

  return apiGet<Station[]>(`/api/stations/nearby?${params.toString()}`, init);
}

export async function getStation(id: number, init?: RequestInit): Promise<Station | undefined> {
  return apiGet<Station>(`/api/stations/${id}`, init);
}
