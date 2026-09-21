import { mockCities } from "@/mocks/locations";
import type { City } from "@/types/location";
import { apiGet } from "./client";

export async function getCities(provinceId?: number): Promise<City[]> {
  try {
    const query = provinceId ? `?provinceId=${provinceId}` : "";
    return await apiGet<City[]>(`/api/cities${query}`);
  } catch {
    return provinceId ? mockCities.filter((city) => city.provinceId === provinceId) : mockCities;
  }
}

export async function getCityBySlug(slug: string): Promise<City | undefined> {
  const cities = await getCities();
  return cities.find((city) => city.slug === slug);
}
