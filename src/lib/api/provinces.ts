import { mockProvinces } from "@/mocks/locations";
import type { Province } from "@/types/location";
import { apiGet } from "./client";

export async function getProvinces(regionId: number): Promise<Province[]> {
  try {
    return await apiGet<Province[]>(`/api/provinces?regionId=${regionId}`);
  } catch {
    return mockProvinces.filter((province) => province.regionId === regionId);
  }
}
