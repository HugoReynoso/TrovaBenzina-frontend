import { mockStations } from "@/mocks/stations";
import { getStationPrice, sortStationsByPrice } from "@/lib/price";
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

export async function getStations(query: StationQuery): Promise<Station[]> {
  try {
    return await apiGet<Station[]>(
      `/api/stations?cityId=${query.cityId}&fuelType=${query.fuelType}${serviceModeToParam(query.serviceMode)}`
    );
  } catch {
    return mockStations.filter((station) => {
      if (station.cityId !== query.cityId) {
        return false;
      }

      const price = getStationPrice(station, query.fuelType, query.serviceMode ?? "all");
      return Boolean(price);
    });
  }
}

export async function getCheapestStations(
  cityId: number,
  fuelType: FuelTypeCode,
  limit = 10,
  serviceMode: ServiceMode = "self"
): Promise<Station[]> {
  try {
    return await apiGet<Station[]>(
      `/api/stations/cheapest?cityId=${cityId}&fuelType=${fuelType}&limit=${limit}${serviceModeToParam(serviceMode)}`
    );
  } catch {
    const stations = mockStations.filter((station) => station.cityId === cityId);
    return sortStationsByPrice(stations, fuelType, serviceMode).slice(0, limit);
  }
}

export async function getStation(id: number): Promise<Station | undefined> {
  try {
    return await apiGet<Station>(`/api/stations/${id}`);
  } catch {
    return mockStations.find((station) => station.id === id);
  }
}
