const http = require("http");

const now = new Date().toISOString();

const cities = [
  { id: 1, name: "Milano", slug: "milano", provinceId: 1, provinceName: "Milano", regionName: "Lombardia", latitude: 45.4642, longitude: 9.19 },
  { id: 2, name: "Roma", slug: "roma", provinceId: 2, provinceName: "Roma", regionName: "Lazio", latitude: 41.9028, longitude: 12.4964 },
  { id: 3, name: "Torino", slug: "torino", provinceId: 3, provinceName: "Torino", regionName: "Piemonte", latitude: 45.0703, longitude: 7.6869 },
  { id: 4, name: "Napoli", slug: "napoli", provinceId: 4, provinceName: "Napoli", regionName: "Campania", latitude: 40.8518, longitude: 14.2681 },
  { id: 5, name: "Bologna", slug: "bologna", provinceId: 5, provinceName: "Bologna", regionName: "Emilia-Romagna", latitude: 44.4949, longitude: 11.3426 },
  { id: 6, name: "Firenze", slug: "firenze", provinceId: 6, provinceName: "Firenze", regionName: "Toscana", latitude: 43.7696, longitude: 11.2558 }
];

const regions = [
  { id: 1, name: "Lombardia" },
  { id: 2, name: "Lazio" },
  { id: 3, name: "Piemonte" },
  { id: 4, name: "Campania" },
  { id: 5, name: "Emilia-Romagna" },
  { id: 6, name: "Toscana" }
];

const provinces = cities.map((city) => ({
  id: city.provinceId,
  name: city.provinceName,
  code: city.provinceName.slice(0, 2).toUpperCase(),
  regionId: regions.find((region) => region.name === city.regionName)?.id ?? 1
}));

const fuelNames = {
  BENZINA: "Benzina",
  DIESEL: "Diesel",
  GPL: "GPL",
  METANO: "Metano"
};

function priceFor(fuelType, cityId, index, selfService) {
  const base = fuelType === "GPL" ? 0.795 : fuelType === "METANO" ? 1.245 : fuelType === "DIESEL" ? 1.665 : 1.735;
  return Number((base + cityId * 0.003 + index * 0.011 + (selfService ? 0 : 0.12)).toFixed(3));
}

function stationFor(city, index) {
  const brands = ["IP", "Pompa Bianca", "Q8", "Eni", "Esso"];
  const brand = brands[index % brands.length];
  const fuelTypes = ["BENZINA", "DIESEL", "GPL", "METANO"];
  return {
    id: city.id * 100 + index,
    mimitId: `DEMO-${city.id}-${index}`,
    name: `${brand} ${city.name} ${index + 1}`,
    brand,
    address: `Via Demo ${index + 1}, ${city.name}`,
    latitude: city.latitude + (index - 2) * 0.01,
    longitude: city.longitude + (index - 2) * 0.01,
    cityId: city.id,
    cityName: city.name,
    provinceName: city.provinceName,
    regionName: city.regionName,
    prices: fuelTypes.flatMap((fuelType) => [
      {
        fuelTypeCode: fuelType,
        fuelTypeName: fuelNames[fuelType],
        price: priceFor(fuelType, city.id, index, true),
        selfService: true,
        communicatedAt: now
      },
      {
        fuelTypeCode: fuelType,
        fuelTypeName: fuelNames[fuelType],
        price: priceFor(fuelType, city.id, index, false),
        selfService: false,
        communicatedAt: now
      }
    ])
  };
}

function stationsFor(cityId) {
  const city = cities.find((item) => item.id === Number(cityId)) ?? cities[0];
  return Array.from({ length: 5 }, (_, index) => ({
    ...stationFor(city, index),
    distanceKm: Number((0.8 + index * 1.35).toFixed(2))
  }));
}

function stationsForProvince(provinceId) {
  return cities
    .filter((city) => city.provinceId === Number(provinceId))
    .flatMap((city) => stationsFor(city.id));
}

function statisticFor(cityId, fuelType) {
  const city = cities.find((item) => item.id === Number(cityId)) ?? cities[0];
  const stations = stationsFor(city.id);
  const prices = stations.flatMap((station) => station.prices).filter((price) => price.fuelTypeCode === fuelType && price.selfService);
  const values = prices.map((price) => price.price);
  return {
    cityId: city.id,
    cityName: city.name,
    fuelTypeCode: fuelType,
    averagePrice: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3)),
    minimumPrice: Math.min(...values),
    maximumPrice: Math.max(...values),
    stationCount: stations.length,
    updatedAt: now
  };
}

function historyFor(cityId, fuelType) {
  const statistic = statisticFor(cityId, fuelType);
  return Array.from({ length: 8 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (7 - index) * 7);
    const delta = (index - 3) * 0.004;
    return {
      date: date.toISOString().slice(0, 10),
      averagePrice: Number((statistic.averagePrice + delta).toFixed(3)),
      minimumPrice: Number((statistic.minimumPrice + delta).toFixed(3)),
      maximumPrice: Number((statistic.maximumPrice + delta).toFixed(3))
    };
  });
}

function send(response, payload, status = 200) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  });
  response.end(JSON.stringify(payload));
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost:8080");
  const path = url.pathname;

  if (path === "/api/regions") return send(response, regions);
  if (path === "/api/provinces") return send(response, provinces);
  if (path === "/api/cities") return send(response, cities);

  const stationMatch = path.match(/^\/api\/stations\/(\d+)$/);
  if (stationMatch) {
    const stations = cities.flatMap((city) => stationsFor(city.id));
    return send(response, stations.find((station) => station.id === Number(stationMatch[1])) ?? stations[0]);
  }

  if (path === "/api/stations" || path === "/api/stations/cheapest" || path === "/api/stations/nearby") {
    const provinceId = url.searchParams.get("provinceId");
    const cityId = url.searchParams.get("cityId") ?? nearestCityId(url.searchParams.get("lat"), url.searchParams.get("lng"));
    const fuelType = url.searchParams.get("fuelType") ?? "BENZINA";
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const stations = (provinceId ? stationsForProvince(provinceId) : stationsFor(cityId))
      .filter((station) => station.prices.some((price) => price.fuelTypeCode === fuelType))
      .slice(0, limit);
    return send(response, stations);
  }

  const statisticMatch = path.match(/^\/api\/cities\/(\d+)\/fuel-statistics(\/history)?$/);
  if (statisticMatch) {
    const fuelType = url.searchParams.get("fuelType") ?? "BENZINA";
    return send(response, statisticMatch[2] ? historyFor(statisticMatch[1], fuelType) : statisticFor(statisticMatch[1], fuelType));
  }

  if (request.method === "POST" && path === "/api/price-reports") return send(response, { id: 1, status: "pending" }, 201);
  if (request.method === "POST" && path === "/api/auth/login") return send(response, { token: "demo-token" });
  if (path.startsWith("/api/admin/")) return send(response, []);

  return send(response, { message: "Not found" }, 404);
});

function nearestCityId(lat, lng) {
  if (!lat || !lng) return "1";

  const position = { latitude: Number(lat), longitude: Number(lng) };
  const nearest = cities.reduce((best, city) => {
    const bestDistance = Math.hypot(best.latitude - position.latitude, best.longitude - position.longitude);
    const cityDistance = Math.hypot(city.latitude - position.latitude, city.longitude - position.longitude);
    return cityDistance < bestDistance ? city : best;
  }, cities[0]);

  return String(nearest.id);
}

server.listen(8080, "127.0.0.1", () => {
  console.log("Demo API listening on http://127.0.0.1:8080");
});
