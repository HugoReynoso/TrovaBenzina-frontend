import type { FuelTypeCode } from "@/types/fuel";
import type { CityFuelStatistic, PriceHistoryPoint } from "@/types/statistics";

export const mockStatistics: CityFuelStatistic[] = [
  {
    cityId: 1,
    cityName: "Milano",
    fuelTypeCode: "BENZINA",
    averagePrice: 1.759,
    minimumPrice: 1.697,
    maximumPrice: 1.836,
    stationCount: 5,
    updatedAt: "2026-09-20T08:30:00.000Z"
  },
  {
    cityId: 1,
    cityName: "Milano",
    fuelTypeCode: "DIESEL",
    averagePrice: 1.651,
    minimumPrice: 1.608,
    maximumPrice: 1.711,
    stationCount: 5,
    updatedAt: "2026-09-20T08:30:00.000Z"
  },
  {
    cityId: 1,
    cityName: "Milano",
    fuelTypeCode: "GPL",
    averagePrice: 0.719,
    minimumPrice: 0.704,
    maximumPrice: 0.735,
    stationCount: 3,
    updatedAt: "2026-09-20T08:30:00.000Z"
  },
  {
    cityId: 1,
    cityName: "Milano",
    fuelTypeCode: "METANO",
    averagePrice: 1.409,
    minimumPrice: 1.389,
    maximumPrice: 1.429,
    stationCount: 2,
    updatedAt: "2026-09-20T08:30:00.000Z"
  }
];

const benzinaHistory: PriceHistoryPoint[] = [
  { date: "2026-04-01", averagePrice: 1.812, minimumPrice: 1.742, maximumPrice: 1.914 },
  { date: "2026-05-01", averagePrice: 1.793, minimumPrice: 1.718, maximumPrice: 1.897 },
  { date: "2026-06-01", averagePrice: 1.774, minimumPrice: 1.703, maximumPrice: 1.868 },
  { date: "2026-07-01", averagePrice: 1.768, minimumPrice: 1.699, maximumPrice: 1.852 },
  { date: "2026-08-01", averagePrice: 1.752, minimumPrice: 1.688, maximumPrice: 1.841 },
  { date: "2026-09-01", averagePrice: 1.759, minimumPrice: 1.697, maximumPrice: 1.836 }
];

function offsetHistory(points: PriceHistoryPoint[], offset: number): PriceHistoryPoint[] {
  return points.map((point) => ({
    ...point,
    averagePrice: Number((point.averagePrice + offset).toFixed(3)),
    minimumPrice: Number((point.minimumPrice + offset).toFixed(3)),
    maximumPrice: Number((point.maximumPrice + offset).toFixed(3))
  }));
}

export const mockHistory: Record<`${number}-${FuelTypeCode}`, PriceHistoryPoint[]> = {
  "1-BENZINA": benzinaHistory,
  "1-DIESEL": offsetHistory(benzinaHistory, -0.108),
  "1-GPL": offsetHistory(benzinaHistory, -1.04),
  "1-METANO": offsetHistory(benzinaHistory, -0.35)
};
