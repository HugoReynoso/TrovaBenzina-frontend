import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { Station, StationPrice } from "@/types/station";

export type PriceTone = "cheap" | "average" | "high";

export function formatEuro(value: number, intl = "it-IT"): string {
  return new Intl.NumberFormat(intl, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(value);
}

/** Prezzo al litro senza simbolo di valuta (es. "1,839"), per spazi stretti come i marker sulla mappa. */
export function formatPrice(value: number, intl = "it-IT"): string {
  return new Intl.NumberFormat(intl, { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value);
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

/** "27 settembre 2026": data dell'ultimo prezzo comunicato nei dati, o null se non c'e'. */
export function formatLatestUpdate(stations: Station[], intl = "it-IT"): string | null {
  const latest = latestCommunicationTime(stations);
  if (!latest) {
    return null;
  }
  return new Intl.DateTimeFormat(intl, { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" }).format(new Date(latest));
}

/** Sotto/sopra queste frazioni della mediana un prezzo e' considerato un errore di comunicazione (es. 1,000 o 0,123 €/l). */
export const MIN_PLAUSIBLE_PRICE_RATIO = 0.7;
export const MAX_PLAUSIBLE_PRICE_RATIO = 1.5;
const MIN_SAMPLES_FOR_OUTLIER_CHECK = 5;

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

/**
 * Scarta i distributori con prezzi palesemente sbagliati rispetto agli altri della stessa zona
 * (per carburante e modalita scelti). Con pochi dati non filtra nulla.
 */
export function filterPlausibleStations(stations: Station[], fuelType: FuelTypeCode, serviceMode: ServiceMode): Station[] {
  const priced = stations
    .map((station) => ({ station, price: getStationPrice(station, fuelType, serviceMode)?.price }))
    .filter((entry): entry is { station: Station; price: number } => typeof entry.price === "number" && entry.price > 0);

  if (priced.length < MIN_SAMPLES_FOR_OUTLIER_CHECK) {
    return priced.map((entry) => entry.station);
  }

  const reference = median(priced.map((entry) => entry.price));
  const minimum = reference * MIN_PLAUSIBLE_PRICE_RATIO;
  const maximum = reference * MAX_PLAUSIBLE_PRICE_RATIO;
  return priced.filter((entry) => entry.price >= minimum && entry.price <= maximum).map((entry) => entry.station);
}

/** Prezzi affidabili per le classifiche: comunicati di recente e non anomali. */
export function filterReliableStations(
  stations: Station[],
  fuelType: FuelTypeCode,
  serviceMode: ServiceMode,
  referenceTime: number
): Station[] {
  return filterPlausibleStations(filterRecentStations(stations, fuelType, serviceMode, referenceTime), fuelType, serviceMode);
}
