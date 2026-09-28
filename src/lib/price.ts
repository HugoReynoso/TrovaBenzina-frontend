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

/** I prezzi comunicati da piu' di questi giorni non compaiono nelle liste "top". */
export const MAX_PRICE_AGE_DAYS = 4;

const DAY_MS = 24 * 60 * 60 * 1000;

export function isPriceRecent(price: StationPrice, referenceTime: number, maxAgeDays = MAX_PRICE_AGE_DAYS): boolean {
  const communicatedAt = Date.parse(price.communicatedAt);
  return Number.isFinite(communicatedAt) && referenceTime - communicatedAt <= maxAgeDays * DAY_MS;
}

/** Data della comunicazione piu' recente presente nei dati (usata come riferimento stabile prima dell'idratazione). */
export function latestCommunicationTime(stations: Station[]): number {
  let latest = 0;
  for (const station of stations) {
    for (const price of station.prices) {
      const time = Date.parse(price.communicatedAt);
      if (Number.isFinite(time) && time > latest) {
        latest = time;
      }
    }
  }
  return latest;
}

/**
 * Tiene solo i distributori il cui prezzo (per carburante e modalita scelti) e' stato
 * comunicato negli ultimi MAX_PRICE_AGE_DAYS giorni rispetto a `referenceTime`.
 */
export function filterRecentStations(
  stations: Station[],
  fuelType: FuelTypeCode,
  serviceMode: ServiceMode,
  referenceTime: number,
  maxAgeDays = MAX_PRICE_AGE_DAYS
): Station[] {
  return stations.filter((station) => {
    const price = getStationPrice(station, fuelType, serviceMode);
    return price ? isPriceRecent(price, referenceTime, maxAgeDays) : false;
  });
}
