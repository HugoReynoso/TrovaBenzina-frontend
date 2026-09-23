import type { Region } from "@/types/location";
import { apiGet } from "./client";

export async function getRegions(): Promise<Region[]> {
  return apiGet<Region[]>("/api/regions");
}
