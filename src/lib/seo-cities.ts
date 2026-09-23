import type { City } from "@/types/location";

export const SEO_CITY_SLUGS = ["milano", "roma", "torino", "napoli", "bologna", "firenze"];

export function getSeoCities(cities: City[]): City[] {
  const seoCities = cities.filter((city) => SEO_CITY_SLUGS.includes(city.slug));
  return seoCities.length > 0 ? seoCities : cities.slice(0, 6);
}
