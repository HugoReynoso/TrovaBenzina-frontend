import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { Station, StationPrice } from "@/types/station";

export type PriceTone = "cheap" | "average" | "high";

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(value);
}

export function getStationPrice(
  station: Station,
  fuelType: FuelTypeCode,
  serviceMode: ServiceMode
): StationPrice | undefined {
  const matches = station.prices.filter((price) => price.fuelTypeCode === fuelType);

  if (serviceMode === "all") {
    return matches.sort((a, b) => a.price - b.price)[0];
  }

  const selfService = serviceMode === "self";
  return matches.find((price) => price.selfService === selfService);
}

export function getPriceTone(price: number, average: number): PriceTone {
  const delta = price - average;

  if (delta <= -0.035) {
    return "cheap";
  }

  if (delta >= 0.035) {
    return "high";
  }

  return "average";
}

export function sortStationsByPrice(
  stations: Station[],
  fuelType: FuelTypeCode,
  serviceMode: ServiceMode
): Station[] {
  return [...stations].sort((left, right) => {
    const leftPrice = getStationPrice(left, fuelType, serviceMode)?.price ?? Number.POSITIVE_INFINITY;
    const rightPrice = getStationPrice(right, fuelType, serviceMode)?.price ?? Number.POSITIVE_INFINITY;
    return leftPrice - rightPrice;
  });
}
