"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fuel, Navigation, RefreshCw, Search } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { DynamicStationMap } from "@/features/map/DynamicStationMap";
import type { LocationStatus } from "@/features/map/StationMap";
import { getCityFuelStatistics } from "@/lib/api/statistics";
import { getNearbyStations, getStations } from "@/lib/api/stations";
import { getStationPrice, sortStationsByPrice } from "@/lib/price";
import { buildCityFuelStatistic } from "@/lib/statistics";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import { FUEL_TYPES } from "@/types/fuel";
import type { City, Province } from "@/types/location";
import type { Station } from "@/types/station";
import type { CityFuelStatistic } from "@/types/statistics";

interface MapExperienceProps {
  cities: City[];
  provinces: Province[];
  initialCity: City;
  initialProvince: Province;
  stations: Station[];
  statistic: CityFuelStatistic;
}

interface UserPosition {
  latitude: number;
  longitude: number;
}

interface LoadedMapData {
  stations: Station[];
  statistic: CityFuelStatistic;
}

function distanceKm(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }): number {
  const earthRadiusKm = 6371;
  const degreesToRadians = Math.PI / 180;
  const deltaLatitude = (to.latitude - from.latitude) * degreesToRadians;
  const deltaLongitude = (to.longitude - from.longitude) * degreesToRadians;
  const fromLatitude = from.latitude * degreesToRadians;
  const toLatitude = to.latitude * degreesToRadians;
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function findProvinceCenter(cities: City[], province: Province, fallbackCity: City): City {
  return (
    cities.find((city) => city.provinceId === province.id && city.name.toLowerCase() === province.name.toLowerCase()) ??
    cities.find((city) => city.provinceId === province.id) ??
    fallbackCity
  );
}

const LOCATION_DENIED_MESSAGE =
  "Hai negato l'accesso alla posizione. Abilitalo dalle impostazioni del browser oppure scegli una provincia.";
const LOCATION_UNAVAILABLE_MESSAGE =
  "Non riesco a trovare la tua posizione in questo momento. Riprova tra qualche secondo oppure scegli una provincia.";

function formatSavings(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function MapExperience({ cities, provinces, initialCity, initialProvince, stations, statistic }: MapExperienceProps) {
  const [fuelType, setFuelType] = useState<FuelTypeCode>("BENZINA");
  const [serviceMode, setServiceMode] = useState<ServiceMode>("self");
  const [provinceId, setProvinceId] = useState(initialProvince.id);
  const [searchVersion, setSearchVersion] = useState(0);
  const [visibleStations, setVisibleStations] = useState(stations);
  const [currentStatistic, setCurrentStatistic] = useState(statistic);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");
  const userSelectedProvinceRef = useRef(false);
  const stationListRef = useRef<HTMLOListElement>(null);
  const dataCacheRef = useRef(new Map<string, LoadedMapData>());
  const loadedKeyRef = useRef(`province:${initialProvince.id}:BENZINA:self:0`);

  const selectedProvince = useMemo(
    () => provinces.find((province) => province.id === provinceId) ?? initialProvince,
    [initialProvince, provinceId, provinces]
  );
  const selectedCity = useMemo(
    () => findProvinceCenter(cities, selectedProvince, initialCity),
    [cities, initialCity, selectedProvince]
  );
  const isUsingUserPosition = Boolean(userPosition) && !userSelectedProvinceRef.current;
  const listTitle = isUsingUserPosition ? "Distributori vicino a te" : `Distributori in provincia di ${selectedProvince.name}`;

  const orderedStations = useMemo(
    () =>
      sortStationsByPrice(visibleStations, fuelType, serviceMode).filter((station) => getStationPrice(station, fuelType, serviceMode)),
    [fuelType, serviceMode, visibleStations]
  );
  const mapStations = orderedStations;

  // Quando cambiano i risultati (nuova provincia, "Posizionami", filtri) riporta la lista in cima,
  // altrimenti resta scorsa dove si trovava e la nuova "top" dei prezzi non si vede.
  useEffect(() => {
    stationListRef.current?.scrollTo({ top: 0, left: 0 });
  }, [orderedStations]);

  function handleLocationStatusChange(status: LocationStatus) {
    if (status === "loading" || status === "ready") {
      setLocationError("");
    } else if (status === "denied") {
      setLocationError(LOCATION_DENIED_MESSAGE);
    } else if (status === "unavailable") {
      setLocationError(LOCATION_UNAVAILABLE_MESSAGE);
    }
  }
  const cheapestPrice = orderedStations.map((station) => getStationPrice(station, fuelType, serviceMode)?.price).find(Boolean);
  const savingOnTank = cheapestPrice ? Math.max(0, (currentStatistic.averagePrice - cheapestPrice) * 50) : 0;

  useEffect(() => {
    dataCacheRef.current.set(`province:${initialProvince.id}:BENZINA:self:0`, {
      stations,
      statistic
    });
  }, [initialProvince.id, stations, statistic]);

  function handleFuelChange(nextFuelType: FuelTypeCode) {
    setFuelType(nextFuelType);
    if (nextFuelType === "GPL") {
      setServiceMode("served");
    }
  }

  const handleUserPositionChange = useCallback((nextPosition: UserPosition, forceRefresh = false) => {
    userSelectedProvinceRef.current = false;
    setUserPosition(nextPosition);

    const nearestCity = cities.reduce((nearest, city) =>
      distanceKm(nextPosition, city) < distanceKm(nextPosition, nearest) ? city : nearest
    );
    setProvinceId(nearestCity.provinceId);

    if (forceRefresh) {
      setSearchVersion((version) => version + 1);
    }
  }, [cities]);

  useEffect(() => {
    const shouldUseUserPosition = isUsingUserPosition;
    const requestKey =
      shouldUseUserPosition && userPosition
        ? `nearby:${userPosition.latitude.toFixed(4)}:${userPosition.longitude.toFixed(4)}:${fuelType}:${serviceMode}:${searchVersion}`
        : `province:${selectedProvince.id}:${fuelType}:${serviceMode}:${searchVersion}`;

    if (requestKey === loadedKeyRef.current) {
      return;
    }

    const cachedData = dataCacheRef.current.get(requestKey);
    if (cachedData) {
      setVisibleStations(cachedData.stations);
      setCurrentStatistic(cachedData.statistic);
      setError("");
      loadedKeyRef.current = requestKey;
      return;
    }

    const abortController = new AbortController();

    async function loadMapData() {
      setIsLoading(true);
      setError("");

      try {
        const stationsPromise =
          shouldUseUserPosition && userPosition
            ? getNearbyStations(
                { lat: userPosition.latitude, lng: userPosition.longitude, fuelType, serviceMode, limit: 1000 },
                { signal: abortController.signal }
              )
            : getStations({ provinceId: selectedProvince.id, limit: 1500 }, { signal: abortController.signal });

        const [stationsResult, statisticResult] = await Promise.allSettled([
          stationsPromise,
          getCityFuelStatistics(selectedCity.id, fuelType, { signal: abortController.signal })
        ]);

        if (abortController.signal.aborted) {
          return;
        }

        const nextStations = stationsResult.status === "fulfilled" ? stationsResult.value : [];
        const nextStatistic =
          nextStations.length > 0
            ? buildCityFuelStatistic(selectedCity, fuelType, nextStations)
            : statisticResult.status === "fulfilled"
              ? statisticResult.value
              : buildCityFuelStatistic(selectedCity, fuelType, []);

        const nextData = { stations: nextStations, statistic: nextStatistic };
        dataCacheRef.current.set(requestKey, nextData);
        loadedKeyRef.current = requestKey;
        setVisibleStations(nextStations);
        setCurrentStatistic(nextStatistic);

        if (stationsResult.status === "rejected") {
          setError(stationsResult.reason instanceof Error ? stationsResult.reason.message : "Impossibile caricare i distributori.");
        }
      } catch (loadError) {
        if (!abortController.signal.aborted) {
          setVisibleStations([]);
          setError(loadError instanceof Error ? loadError.message : "Impossibile caricare i dati in questo momento.");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadMapData();

    return () => {
      abortController.abort();
    };
  }, [fuelType, isUsingUserPosition, searchVersion, selectedCity, selectedProvince.id, serviceMode, userPosition]);

  return (
    <section className="grid min-h-[calc(100dvh-65px)] min-w-0 bg-[#eef2ee] lg:h-[calc(100dvh-65px)] lg:grid-cols-[minmax(0,1fr)_460px] lg:overflow-hidden">
      <div className="relative min-w-0 map-experience__canvas lg:min-h-0">
        <MapFilters
          fuelType={fuelType}
          isLoading={isLoading}
          onFuelChange={handleFuelChange}
          onProvinceChange={(nextProvinceId) => {
            userSelectedProvinceRef.current = true;
            setProvinceId(nextProvinceId);
          }}
          onRefresh={() => setSearchVersion((version) => version + 1)}
          onServiceModeChange={setServiceMode}
          provinces={provinces}
          selectedProvinceId={selectedProvince.id}
          serviceMode={serviceMode}
        />
        <DynamicStationMap
          city={selectedCity}
          stations={mapStations}
          fuelType={fuelType}
          serviceMode={serviceMode}
          averagePrice={currentStatistic.averagePrice}
          userPosition={isUsingUserPosition ? userPosition : null}
          locationLoading={isUsingUserPosition && isLoading}
          onUserPositionChange={(position) => handleUserPositionChange(position, true)}
          onLocationStatusChange={handleLocationStatusChange}
          locationControlClassName="top-[118px] sm:top-3"
          className="map-experience__leaflet w-full min-w-0 overflow-hidden border-y border-ink/10 bg-white lg:h-full lg:min-h-0 lg:border-0"
        />
      </div>

      <aside className="flex min-h-0 min-w-0 flex-col border-t border-ink/10 bg-white lg:border-l lg:border-t-0" aria-labelledby="map-results-title">
        <div className="border-b border-ink/10 bg-white p-3 lg:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-petrol">TrovaBenzina</p>
              <h1 id="map-results-title" className="text-lg font-black leading-tight text-ink lg:truncate lg:text-xl">
                {listTitle}
              </h1>
            </div>
            <div className="flex shrink-0 gap-2">
              <span className="rounded-md bg-ink/[0.035] px-3 py-2 text-sm font-black text-ink">Distributori ({orderedStations.length})</span>
            </div>
          </div>
        </div>

        <div className="bg-mint px-4 py-3 text-sm font-black uppercase tracking-[0.02em] text-white">
          Risparmio: {formatSavings(savingOnTank)} su un pieno di 50L
        </div>

        {locationError ? <p className="m-3 rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{locationError}</p> : null}
        {error ? <p className="m-3 rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{error}</p> : null}

        <ol ref={stationListRef} className="map-station-carousel flex w-full min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-3 py-3 lg:grid lg:flex-1 lg:auto-rows-min lg:gap-0 lg:overflow-x-hidden lg:overflow-y-auto lg:px-0 lg:py-0">
          {orderedStations.length > 0 ? (
            orderedStations.map((station, index) => (
              <MapStationCard key={station.id} station={station} index={index} fuelType={fuelType} serviceMode={serviceMode} />
            ))
          ) : (
            <li className="min-w-[82vw] rounded-md border border-dashed border-ink/20 bg-white p-5 text-sm font-bold text-ink/66 lg:m-4 lg:min-w-0">
              Nessun distributore trovato con questi filtri.
            </li>
          )}
        </ol>
      </aside>
    </section>
  );
}

function MapFilters({
  fuelType,
  isLoading,
  onFuelChange,
  onProvinceChange,
  onRefresh,
  onServiceModeChange,
  provinces,
  selectedProvinceId,
  serviceMode
}: {
  fuelType: FuelTypeCode;
  isLoading: boolean;
  onFuelChange: (fuelType: FuelTypeCode) => void;
  onProvinceChange: (provinceId: number) => void;
  onRefresh: () => void;
  onServiceModeChange: (mode: ServiceMode) => void;
  provinces: Province[];
  selectedProvinceId: number;
  serviceMode: ServiceMode;
}) {
  const sortedProvinces = useMemo(() => [...provinces].sort((left, right) => left.name.localeCompare(right.name, "it")), [provinces]);

  return (
    <div className="absolute left-3 right-3 top-3 z-[650] grid max-w-3xl gap-2 sm:left-4 sm:right-auto sm:w-[min(720px,calc(100%-2rem))]">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <label className="relative">
          <Fuel className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-petrol" size={16} aria-hidden="true" />
          <select
            className="h-11 w-full min-w-0 appearance-none rounded-md border border-ink/15 bg-white/96 px-9 pr-8 text-sm font-black text-ink shadow-sm outline-none sm:w-auto"
            value={fuelType}
            onChange={(event) => onFuelChange(event.target.value as FuelTypeCode)}
            aria-label="Scegli carburante"
          >
            {FUEL_TYPES.map((fuel) => (
              <option key={fuel.code} value={fuel.code}>
                {fuel.name.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <select
          className="h-11 w-full min-w-0 truncate rounded-md border border-ink/15 bg-white/96 px-3 text-sm font-black text-ink shadow-sm outline-none sm:w-auto"
          value={selectedProvinceId}
          onChange={(event) => onProvinceChange(Number(event.target.value))}
          aria-label="Scegli provincia"
        >
          {sortedProvinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
        <select
          className="h-11 w-full min-w-0 rounded-md border border-ink/15 bg-white/96 px-3 text-sm font-black text-ink shadow-sm outline-none sm:w-auto"
          value={serviceMode}
          onChange={(event) => onServiceModeChange(event.target.value as ServiceMode)}
          aria-label="Scegli modalita prezzo"
        >
          <option value="self">Self</option>
          <option value="served">Servito</option>
          <option value="all">Miglior prezzo</option>
        </select>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-black text-white shadow-sm transition hover:bg-petrol"
          aria-label="Trova distributori"
          title="Trova distributori"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? <RefreshCw className="animate-spin" size={17} aria-hidden="true" /> : <Search size={17} aria-hidden="true" />}
          Trova
        </button>
      </div>
    </div>
  );
}

function MapStationCard({
  fuelType,
  index,
  serviceMode,
  station
}: {
  fuelType: FuelTypeCode;
  index: number;
  serviceMode: ServiceMode;
  station: Station;
}) {
  const price = getStationPrice(station, fuelType, serviceMode);

  return (
    <li className="map-station-carousel__item w-[min(82vw,360px)] min-w-0 shrink-0 snap-center border border-ink/10 bg-white p-4 shadow-sm lg:w-auto lg:shrink lg:snap-none lg:border-x-0 lg:border-t-0 lg:shadow-none">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-petrol">#{index + 1}</p>
          <h2 className="mt-1 line-clamp-2 text-lg font-black leading-tight text-ink">{station.name}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-ink/68">
            {station.address} {station.cityName ? `${station.cityName} (${station.provinceName})` : ""}
          </p>
        </div>
        <BrandLogo brand={station.brand} compact />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-petrol/10 px-2 py-1 text-xs font-bold text-petrol">Stradale</span>
        {station.distanceKm ? <span className="rounded-md bg-ink/[0.045] px-2 py-1 text-xs font-bold text-ink/62">{station.distanceKm.toFixed(1)} km</span> : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <a
          className="grid size-10 place-items-center rounded-md bg-[#0b5ca8] text-white transition hover:bg-[#084b89] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b5ca8]"
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Avvia il percorso per ${station.name} su Google Maps`}
          title="Apri il percorso su Google Maps"
        >
          <Navigation size={20} aria-hidden="true" />
        </a>
        <p className="rounded-md bg-mint px-3 py-2 text-xl font-black leading-none text-white shadow-sm">
          {price ? price.price.toFixed(3) : "-"}
          <span className="ml-1 text-xs">€/L</span>
        </p>
      </div>
    </li>
  );
}
