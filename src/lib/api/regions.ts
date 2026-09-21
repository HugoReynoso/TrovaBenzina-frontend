import { mockRegions } from "@/mocks/locations";
import type { Region } from "@/types/location";
import { apiGet } from "./client";

export async function getRegions(): Promise<Region[]> {
  try {
    return await apiGet<Region[]>("/api/regions");
  } catch {
    return mockRegions;
  }
}
