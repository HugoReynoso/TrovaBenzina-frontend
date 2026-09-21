import type { Station } from "@/types/station";

const communicatedAt = "2026-09-20T08:30:00.000Z";

export const mockStations: Station[] = [
  {
    id: 101,
    mimitId: "MI-000101",
    name: "Q8 Loreto",
    brand: "Q8",
    address: "Viale Monza 12, Milano",
    latitude: 45.4852,
    longitude: 9.2186,
    cityId: 1,
    cityName: "Milano",
    provinceName: "Milano",
    regionName: "Lombardia",
    distanceKm: 1.2,
    prices: [
      { fuelTypeCode: "BENZINA", fuelTypeName: "Benzina", price: 1.729, selfService: true, communicatedAt },
      { fuelTypeCode: "BENZINA", fuelTypeName: "Benzina", price: 1.899, selfService: false, communicatedAt },
      { fuelTypeCode: "DIESEL", fuelTypeName: "Diesel", price: 1.639, selfService: true, communicatedAt },
      { fuelTypeCode: "GPL", fuelTypeName: "GPL", price: 0.719, selfService: true, communicatedAt }
    ]
  },
  {
    id: 102,
    mimitId: "MI-000102",
    name: "Eni Porta Romana",
    brand: "Eni",
    address: "Corso Lodi 34, Milano",
    latitude: 45.4507,
    longitude: 9.2057,
    cityId: 1,
    cityName: "Milano",
    provinceName: "Milano",
    regionName: "Lombardia",
    distanceKm: 2.4,
    prices: [
      { fuelTypeCode: "BENZINA", fuelTypeName: "Benzina", price: 1.782, selfService: true, communicatedAt },
      { fuelTypeCode: "BENZINA", fuelTypeName: "Benzina", price: 1.954, selfService: false, communicatedAt },
      { fuelTypeCode: "DIESEL", fuelTypeName: "Diesel", price: 1.674, selfService: true, communicatedAt },
      { fuelTypeCode: "METANO", fuelTypeName: "Metano", price: 1.389, selfService: true, communicatedAt }
    ]
  },
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
    distanceKm: 2.1,
    prices: [
      { fuelTypeCode: "BENZINA", fuelTypeName: "Benzina", price: 1.697, selfService: true, communicatedAt },
      { fuelTypeCode: "DIESEL", fuelTypeName: "Diesel", price: 1.608, selfService: true, communicatedAt },
      { fuelTypeCode: "GPL", fuelTypeName: "GPL", price: 0.704, selfService: true, communicatedAt }
    ]
  },
  {
    id: 104,
    mimitId: "MI-000104",
    name: "Tamoil Sempione",
    brand: "Tamoil",
    address: "Corso Sempione 91, Milano",
    latitude: 45.485,
    longitude: 9.1598,
    cityId: 1,
    cityName: "Milano",
    provinceName: "Milano",
    regionName: "Lombardia",
    distanceKm: 3.5,
    prices: [
      { fuelTypeCode: "BENZINA", fuelTypeName: "Benzina", price: 1.836, selfService: true, communicatedAt },
      { fuelTypeCode: "DIESEL", fuelTypeName: "Diesel", price: 1.711, selfService: true, communicatedAt },
      { fuelTypeCode: "METANO", fuelTypeName: "Metano", price: 1.429, selfService: true, communicatedAt }
    ]
  },
  {
    id: 105,
    mimitId: "MI-000105",
    name: "Esso Bicocca",
    brand: "Esso",
    address: "Viale Sarca 226, Milano",
    latitude: 45.5205,
    longitude: 9.2138,
    cityId: 1,
    cityName: "Milano",
    provinceName: "Milano",
    regionName: "Lombardia",
    distanceKm: 5.1,
    prices: [
      { fuelTypeCode: "BENZINA", fuelTypeName: "Benzina", price: 1.749, selfService: true, communicatedAt },
      { fuelTypeCode: "DIESEL", fuelTypeName: "Diesel", price: 1.624, selfService: true, communicatedAt },
      { fuelTypeCode: "GPL", fuelTypeName: "GPL", price: 0.735, selfService: true, communicatedAt }
    ]
  },
  {
    id: 201,
    mimitId: "RM-000201",
    name: "Q8 San Giovanni",
    brand: "Q8",
    address: "Via Appia Nuova 180, Roma",
    latitude: 41.884,
    longitude: 12.5156,
    cityId: 2,
    cityName: "Roma",
    provinceName: "Roma",
    regionName: "Lazio",
    prices: [
      { fuelTypeCode: "BENZINA", fuelTypeName: "Benzina", price: 1.766, selfService: true, communicatedAt },
      { fuelTypeCode: "DIESEL", fuelTypeName: "Diesel", price: 1.649, selfService: true, communicatedAt }
    ]
  }
];
