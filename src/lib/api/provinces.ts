import type { Province } from "@/types/location";
import { apiGet } from "./client";

export async function getProvinces(regionId?: number): Promise<Province[]> {
  const query = regionId ? `?regionId=${regionId}` : "";
  return apiGet<Province[]>(`/api/provinces${query}`);
}
