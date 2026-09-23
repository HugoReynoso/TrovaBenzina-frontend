import { afterEach, describe, expect, it, vi } from "vitest";
import { getCheapestStations } from "./stations";

describe("stations API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests cheapest stations from the backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 103,
            mimitId: "MI-000103",
            name: "IP Navigli",
            brand: "IP",
            address: "Via Valenza 7, Milano",
            latitude: 45.4525,
            longitude: 9.1714,
            cityId: 1,
            cityName: "Milano",
            provinceName: "Milano",
            regionName: "Lombardia",
            prices: []
          }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    vi.stubGlobal("fetch", fetchMock);

    const stations = await getCheapestStations(1, "BENZINA", 2, "self");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/stations/cheapest?cityId=1&fuelType=BENZINA&limit=2&selfService=true",
      expect.objectContaining({ next: { revalidate: 300 } })
    );
    expect(stations).toHaveLength(1);
    expect(stations[0].name).toBe("IP Navigli");
  });
});
