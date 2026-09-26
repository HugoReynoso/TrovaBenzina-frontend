import { afterEach, describe, expect, it, vi } from "vitest";
import { getCheapestStations, getNearbyStations } from "./stations";

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

  it("requests nearby stations by coordinates", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 104,
            mimitId: "MI-000104",
            name: "Q8 Rho",
            brand: "Q8",
            address: "Via Demo 1, Rho",
            latitude: 45.532,
            longitude: 9.04,
            cityId: 2,
            cityName: "Rho",
            provinceName: "Milano",
            regionName: "Lombardia",
            distanceKm: 1.23,
            prices: []
          }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    vi.stubGlobal("fetch", fetchMock);

    const stations = await getNearbyStations({ lat: 45.53, lng: 9.04, radiusKm: 10, fuelType: "BENZINA", serviceMode: "self", limit: 50 });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/stations/nearby?lat=45.53&lng=9.04&fuelType=BENZINA&selfService=true&radiusKm=10&limit=50",
      expect.objectContaining({ next: { revalidate: 300 } })
    );
    expect(stations[0].distanceKm).toBe(1.23);
  });

  it("requests nearby stations by city and province names", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } })
    );

    vi.stubGlobal("fetch", fetchMock);

    await getNearbyStations({ cityId: 1, city: "Milano", province: "Milano", radiusKm: 10, fuelType: "BENZINA", serviceMode: "self", limit: 50 });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/stations/nearby?cityId=1&city=Milano&province=Milano&fuelType=BENZINA&selfService=true&radiusKm=10&limit=50",
      expect.objectContaining({ next: { revalidate: 300 } })
    );
  });
});
