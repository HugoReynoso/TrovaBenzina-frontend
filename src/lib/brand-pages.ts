import { getFuelBrand } from "@/lib/brand";
import { getProvinces } from "@/lib/api/provinces";
import { getStations } from "@/lib/api/stations";
import { filterReliableStations, getStationPrice, latestCommunicationTime, sortStationsByPrice } from "@/lib/price";
import type { Station } from "@/types/station";

/** Pagine "prezzi per marchio" (/distributori/<slug>): i marchi piu' cercati. */
export const BRAND_PAGES = [
  { slug: "eni", key: "eni", name: "Eni" },
  { slug: "ip", key: "ip", name: "IP" },
  { slug: "q8", key: "q8", name: "Q8" },
  { slug: "esso", key: "esso", name: "Esso" },
  { slug: "tamoil", key: "tamoil", name: "Tamoil" },
  { slug: "pompe-bianche", key: "white", name: "Pompe bianche" }
] as const;

export type BrandPage = (typeof BRAND_PAGES)[number];

export function findBrandPage(slug: string): BrandPage | undefined {
  return BRAND_PAGES.find((brand) => brand.slug === slug);
}

export function brandPath(slug: string): string {
  return `/distributori/${slug}`;
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

let nationalStationsPromise: Promise<Station[]> | null = null;

/**
 * Tutti i distributori d'Italia, provincia per provincia (le stesse richieste delle pagine citta',
 * quindi durante il build arrivano dalla cache). Una sola volta per build.
 */
export function getNationalStations(): Promise<Station[]> {
  nationalStationsPromise ??= (async () => {
    const provinces = await getProvinces();
    const perProvince = await Promise.all(
      provinces.map((province) => getStations({ provinceId: province.id, limit: 1500 }).catch(() => [] as Station[]))
    );
    return perProvince.flat();
  })();
  return nationalStationsPromise;
}

export interface FuelBrandStats {
  fuelType: "BENZINA" | "DIESEL";
  stationCount: number;
  brandTypical: number | null;
  nationalTypical: number | null;
  cheapest: Station[];
  regions: Array<{ region: string; typical: number; stationCount: number }>;
}

export interface BrandStats {
  brand: BrandPage;
  totalStations: number;
  latestUpdate: number;
  fuels: FuelBrandStats[];
}

/** Statistiche self service del marchio (benzina e diesel) confrontate con tutta Italia. */
export async function getBrandStats(brand: BrandPage): Promise<BrandStats> {
  const allStations = await getNationalStations();
  const latestUpdate = latestCommunicationTime(allStations);
  const isBrand = (station: Station) => getFuelBrand(station.brand).key === brand.key;

  const fuels = (["BENZINA", "DIESEL"] as const).map((fuelType): FuelBrandStats => {
    // Stessi controlli del resto del sito: prezzi recenti e non anomali.
    const reliable = filterReliableStations(allStations, fuelType, "self", latestUpdate);
    const priceOf = (station: Station) => getStationPrice(station, fuelType, "self")?.price ?? 0;
    const brandStations = sortStationsByPrice(reliable.filter(isBrand), fuelType, "self");

    const byRegion = new Map<string, number[]>();
    brandStations.forEach((station) => {
      const region = station.regionName ?? "";
      if (region) {
        byRegion.set(region, [...(byRegion.get(region) ?? []), priceOf(station)]);
      }
    });

    return {
      fuelType,
      stationCount: brandStations.length,
      brandTypical: brandStations.length > 0 ? median(brandStations.map(priceOf)) : null,
      nationalTypical: reliable.length > 0 ? median(reliable.map(priceOf)) : null,
      cheapest: brandStations.slice(0, 10),
      regions: [...byRegion.entries()]
        .filter(([, prices]) => prices.length >= 3)
        .map(([region, prices]) => ({ region, typical: median(prices), stationCount: prices.length }))
        .sort((left, right) => left.typical - right.typical)
    };
  });

  return {
    brand,
    totalStations: new Set(allStations.filter(isBrand).map((station) => station.id)).size,
    latestUpdate,
    fuels
  };
}
