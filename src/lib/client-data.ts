import type { City, Province } from "@/types/location";
import type { Station } from "@/types/station";

/**
 * Un comune di riferimento per provincia (quello con lo stesso nome della provincia, altrimenti
 * il primo): e' tutto quello che le pagine interattive usano dei comuni (centro mappa e provincia
 * piu' vicina alla posizione). Passare tutti i ~8.000 comuni aggiungeva ~1,7 MB a ogni pagina.
 */
export function provinceCenterCities(cities: City[], provinces: Province[]): City[] {
  return provinces
    .map(
      (province) =>
        cities.find((city) => city.provinceId === province.id && city.name.toLowerCase() === province.name.toLowerCase()) ??
        cities.find((city) => city.provinceId === province.id)
    )
    .filter((city): city is City => Boolean(city));
}

/** Toglie dai distributori i campi che le pagine interattive non usano, per alleggerire l'HTML. */
export function toClientStations(stations: Station[]): Station[] {
  return stations.map(({ mimitId: _mimitId, regionName: _regionName, prices, ...station }) => ({
    ...station,
    prices: prices.map(({ fuelTypeName: _fuelTypeName, ...price }) => price)
  }));
}
