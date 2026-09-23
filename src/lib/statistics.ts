import type { FuelTypeCode } from "@/types/fuel";
import type { City } from "@/types/location";
import type { Station } from "@/types/station";
import type { CityFuelStatistic } from "@/types/statistics";

export function buildCityFuelStatistic(city: City, fuelType: FuelTypeCode, stations: Station[]): CityFuelStatistic {
  const prices = stations.flatMap((station) => station.prices.filter((price) => price.fuelTypeCode === fuelType));
  const values = prices.map((price) => price.price);
  const latestUpdate = prices
    .map((price) => price.communicatedAt)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  if (values.length === 0) {
    return {
      cityId: city.id,
      cityName: city.name,
      fuelTypeCode: fuelType,
      averagePrice: 0,
      minimumPrice: 0,
      maximumPrice: 0,
      stationCount: 0,
      updatedAt: new Date().toISOString()
    };
  }

  return {
    cityId: city.id,
    cityName: city.name,
    fuelTypeCode: fuelType,
    averagePrice: Number((values.reduce((total, price) => total + price, 0) / values.length).toFixed(3)),
    minimumPrice: Math.min(...values),
    maximumPrice: Math.max(...values),
    stationCount: new Set(stations.filter((station) => station.prices.some((price) => price.fuelTypeCode === fuelType)).map((station) => station.id)).size,
    updatedAt: latestUpdate ?? new Date().toISOString()
  };
}
