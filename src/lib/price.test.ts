import { describe, expect, it } from "vitest";
import { getPriceTone, getStationPrice, sortStationsByPrice } from "./price";
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
});
