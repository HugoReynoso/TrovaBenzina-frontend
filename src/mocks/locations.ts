import type { City, Province, Region } from "@/types/location";

export const mockRegions: Region[] = [
  { id: 1, name: "Lombardia" },
  { id: 2, name: "Lazio" },
  { id: 3, name: "Piemonte" },
  { id: 4, name: "Campania" },
  { id: 5, name: "Emilia-Romagna" },
  { id: 6, name: "Toscana" }
];

export const mockProvinces: Province[] = [
  { id: 1, name: "Milano", code: "MI", regionId: 1 },
  { id: 2, name: "Roma", code: "RM", regionId: 2 },
  { id: 3, name: "Torino", code: "TO", regionId: 3 },
  { id: 4, name: "Napoli", code: "NA", regionId: 4 },
  { id: 5, name: "Bologna", code: "BO", regionId: 5 },
  { id: 6, name: "Firenze", code: "FI", regionId: 6 }
];

export const mockCities: City[] = [
  {
    id: 1,
    name: "Milano",
    slug: "milano",
    provinceId: 1,
    provinceName: "Milano",
    regionName: "Lombardia",
    latitude: 45.4642,
    longitude: 9.19
  },
  {
    id: 2,
    name: "Roma",
    slug: "roma",
    provinceId: 2,
    provinceName: "Roma",
    regionName: "Lazio",
    latitude: 41.9028,
    longitude: 12.4964
  },
  {
    id: 3,
    name: "Torino",
    slug: "torino",
    provinceId: 3,
    provinceName: "Torino",
    regionName: "Piemonte",
    latitude: 45.0703,
    longitude: 7.6869
  },
  {
    id: 4,
    name: "Napoli",
    slug: "napoli",
    provinceId: 4,
    provinceName: "Napoli",
    regionName: "Campania",
    latitude: 40.8518,
    longitude: 14.2681
  },
  {
    id: 5,
    name: "Bologna",
    slug: "bologna",
    provinceId: 5,
    provinceName: "Bologna",
    regionName: "Emilia-Romagna",
    latitude: 44.4949,
    longitude: 11.3426
  },
  {
    id: 6,
    name: "Firenze",
    slug: "firenze",
    provinceId: 6,
    provinceName: "Firenze",
    regionName: "Toscana",
    latitude: 43.7696,
    longitude: 11.2558
  }
];
