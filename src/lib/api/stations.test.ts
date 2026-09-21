import { describe, expect, it } from "vitest";
import { getCheapestStations } from "./stations";

describe("stations API fallback", () => {
  it("returns cheapest mock stations when backend is unavailable", async () => {
    const stations = await getCheapestStations(1, "BENZINA", 2, "self");
    expect(stations).toHaveLength(2);
    expect(stations[0].name).toBe("IP Navigli");
  });
});
