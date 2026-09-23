import type { City } from "@/types/location";
import { apiGet } from "./client";

export async function getCities(provinceId?: number): Promise<City[]> {
  const query = provinceId ? `?provinceId=${provinceId}` : "";
  return apiGet<City[]>(`/api/cities${query}`);
}

export async function getCityBySlug(slug: string): Promise<City | undefined> {
  const cities = await getCities();
  return cities.find((city) => city.slug === slug);
}
