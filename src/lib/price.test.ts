import { describe, expect, it } from "vitest";
import { filterReliableStations, getPriceTone, getStationPrice, sortStationsByPrice } from "./price";
import { buildCityFuelStatistic } from "./statistics";
import type { Station } from "@/types/station";
import { mockStations } from "@/mocks/stations";

describe("price utilities", () => {
  it("assigns price tone relative to average", () => {
    expect(getPriceTone(1.69, 1.75)).toBe("cheap");
    expect(getPriceTone(1.75, 1.75)).toBe("average");
    expect(getPriceTone(1.81, 1.75)).toBe("high");
  });

  it("returns self service price for selected fuel", () => {
    const price = getStationPrice(mockStations[0], "BENZINA", "self");
    expect(price?.price).toBe(1.729);
    expect(price?.selfService).toBe(true);
  });

  it("sorts stations by selected fuel price", () => {
    const sorted = sortStationsByPrice(mockStations.filter((station) => station.cityId === 1), "BENZINA", "self");
    expect(sorted[0].name).toBe("IP Navigli");
  });

  it("excludes old and implausible prices from rankings and statistics", () => {
    const values = [0.123, 1, 1, 1.629, 1.974, 2.049, 2.099, 2.119, 2.139, 2.149, 2.149, 2.159];
    const stations: Station[] = values.map((price, index) => ({
      id: index + 1,
      mimitId: String(index + 1),
      name: `Station ${index + 1}`,
      brand: "Test",
      address: "Via Test",
      latitude: 45,
      longitude: 9,
      cityId: 1,
      cityName: "Milano",
      provinceName: "Milano",
      regionName: "Lombardia",
      prices: [{ fuelTypeCode: "BENZINA", fuelTypeName: "Benzina", price, selfService: true, communicatedAt: "2026-09-26T10:00:00Z" }]
    }));
    stations.push({ ...stations[0], id: 99, prices: [{ ...stations[0].prices[0], price: 1.5, communicatedAt: "2023-01-01T10:00:00Z" }] });

    const reliable = filterReliableStations(stations, "BENZINA", "self", Date.parse("2026-09-27T09:00:00Z"));
    const prices = reliable.map((station) => station.prices[0].price);
    expect(prices).not.toContain(0.123);
    expect(prices).not.toContain(1);
    expect(prices).not.toContain(1.5);
    expect(prices).toContain(1.629);

    const statistic = buildCityFuelStatistic(
      { id: 1, name: "Milano", slug: "milano", provinceId: 1, provinceName: "Milano", regionName: "Lombardia", latitude: 45, longitude: 9 },
      "BENZINA",
      stations
    );
    expect(statistic.minimumPrice).toBe(1.629);
  });
});
