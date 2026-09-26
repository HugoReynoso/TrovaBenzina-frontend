"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, LocateFixed, Search, Trophy } from "lucide-react";
import Link from "next/link";
import { Accordion } from "@/components/Accordion";
import { FuelSelector } from "@/features/filters/FuelSelector";
import { ProvinceSelector } from "@/features/filters/ProvinceSelector";
import { ServiceModeSelector } from "@/features/filters/ServiceModeSelector";
import { DynamicStationMap } from "@/features/map/DynamicStationMap";
import { CheapestStations } from "@/features/stations/CheapestStations";
import { CitySummary } from "@/features/statistics/CitySummary";
import { FuelComposition } from "@/features/statistics/FuelComposition";
import { PriceHistoryChart } from "@/features/statistics/PriceHistoryChart";
import { StatsCards } from "@/features/statistics/StatsCards";
import { NewsPreview } from "@/features/news/NewsPreview";
import { getCityFuelStatistics, getPriceHistory } from "@/lib/api/statistics";
import { getNearbyStations, getStations } from "@/lib/api/stations";
import { buildCityFuelStatistic } from "@/lib/statistics";
import { sortStationsByPrice } from "@/lib/price";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { City, Province } from "@/types/location";
import type { Station } from "@/types/station";
import type { CityFuelStatistic, PriceHistoryPoint } from "@/types/statistics";

interface HomeExperienceProps {
  cities: City[];
  provinces: Province[];
  initialCity: City;
  initialProvince: Province;
  stations: Station[];
  statistic: CityFuelStatistic;
  history: PriceHistoryPoint[];
}

interface LoadedCityData {
  stations: Station[];
  cheapest: Station[];
  statistic: CityFuelStatistic;
  history: PriceHistoryPoint[];
}

interface UserPosition {
  latitude: number;
  longitude: number;
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

function readBrowserPosition(options: PositionOptions): Promise<UserPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      reject,
      options
    );
  });
}

export function HomeExperience({ cities, provinces, initialCity, initialProvince, stations, statistic, history }: HomeExperienceProps) {
  const [fuelType, setFuelType] = useState<FuelTypeCode>("BENZINA");
  const [serviceMode, setServiceMode] = useState<ServiceMode>("self");
  const [provinceId, setProvinceId] = useState(initialProvince.id);
  const [searchVersion, setSearchVersion] = useState(0);
  const [mobileRankingOpen, setMobileRankingOpen] = useState(true);
  const [visibleStations, setVisibleStations] = useState(stations);
  const [cheapest, setCheapest] = useState(() => sortStationsByPrice(stations, "BENZINA", "self").slice(0, 5));
  const [currentStatistic, setCurrentStatistic] = useState(statistic);
  const [currentHistory, setCurrentHistory] = useState(history);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const userSelectedProvinceRef = useRef(false);
  const dataCacheRef = useRef(new Map<string, LoadedCityData>());
  const loadedKeyRef = useRef(`province:${initialProvince.id}:BENZINA:self:0`);

  const selectedProvince = useMemo(
    () => provinces.find((province) => province.id === provinceId) ?? initialProvince,
    [initialProvince, provinceId, provinces]
  );
  const selectedCity = useMemo(
    () => findProvinceCenter(cities, selectedProvince, initialCity),
    [cities, initialCity, selectedProvince]
  );
  const selectedCityId = selectedCity.id;
  const isUsingUserPosition = Boolean(userPosition) && !userSelectedProvinceRef.current;
  const rankingTitle = isUsingUserPosition
    ? "Top 5 piu economici intorno a te"
    : `Top 5 piu economici in provincia di ${selectedProvince.name}`;

  useEffect(() => {
    dataCacheRef.current.set(`province:${initialProvince.id}:BENZINA:self:0`, {
      stations,
      cheapest: sortStationsByPrice(stations, "BENZINA", "self").slice(0, 5),
      statistic,
      history
    });
  }, [history, initialProvince.id, statistic, stations]);

  function handleFuelChange(nextFuelType: FuelTypeCode) {
    setFuelType(nextFuelType);

    if (nextFuelType === "GPL") {
      setServiceMode("served");
    }
  }

  function handleProvinceChange(nextProvinceId: number) {
    userSelectedProvinceRef.current = true;
    setProvinceId(nextProvinceId);
  }

  function searchSelectedProvince() {
    userSelectedProvinceRef.current = true;
    setSearchVersion((version) => version + 1);
  }

  async function requestUserPosition() {
    if (!navigator.geolocation) {
      setError("Geolocalizzazione non disponibile su questo dispositivo.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const position = await readBrowserPosition({
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 9000
      }).catch(() =>
        readBrowserPosition({
          enableHighAccuracy: false,
          maximumAge: 300000,
          timeout: 15000
        })
      );

      handleUserPositionChange(position);
    } catch {
      if (userPosition) {
        handleUserPositionChange(userPosition);
        setError("");
        return;
      }

      setError("Non riesco a usare la tua posizione. Controlla i permessi del browser oppure scegli una provincia.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleUserPositionChange = useCallback((nextPosition: UserPosition) => {
    userSelectedProvinceRef.current = false;
    setUserPosition(nextPosition);

    const nearestCity = cities.reduce((nearest, city) =>
      distanceKm(nextPosition, city) < distanceKm(nextPosition, nearest) ? city : nearest
    );
    setProvinceId(nearestCity.provinceId);
  }, [cities]);

  useEffect(() => {
    if (!navigator.geolocation || cities.length === 0) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (userSelectedProvinceRef.current) {
          return;
        }

        const currentPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        handleUserPositionChange(currentPosition);
      },
      () => {
        setProvinceId(initialProvince.id);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 300000,
        timeout: 7000
      }
    );
  }, [cities, handleUserPositionChange, initialProvince.id]);

  useEffect(() => {
    const shouldUseUserPosition = isUsingUserPosition;
    const requestKey = shouldUseUserPosition
      ? `nearby:${userPosition?.latitude.toFixed(4)}:${userPosition?.longitude.toFixed(4)}:${fuelType}:${serviceMode}:${searchVersion}`
      : `province:${selectedProvince.id}:${fuelType}:${serviceMode}:${searchVersion}`;

    if (requestKey === loadedKeyRef.current) {
      return;
    }

    const cachedData = dataCacheRef.current.get(requestKey);
    if (cachedData) {
      setVisibleStations(cachedData.stations);
      setCheapest(cachedData.cheapest);
      setCurrentStatistic(cachedData.statistic);
      setCurrentHistory(cachedData.history);
      setError("");
      loadedKeyRef.current = requestKey;
      return;
    }

    const abortController = new AbortController();

    async function loadCityData() {
      setIsLoading(true);
      setError("");

      try {
        const stationsPromise =
          shouldUseUserPosition && userPosition
            ? getNearbyStations(
                {
                  lat: userPosition.latitude,
                  lng: userPosition.longitude,
                  fuelType,
                  serviceMode
                },
                { signal: abortController.signal }
              )
            : getStations(
                {
                  provinceId: selectedProvince.id,
                  fuelType,
                  serviceMode
                },
                { signal: abortController.signal }
              );

        const [stationsResult, statisticResult, historyResult] = await Promise.allSettled([
          stationsPromise,
          getCityFuelStatistics(selectedCityId, fuelType, { signal: abortController.signal }),
          getPriceHistory(selectedCityId, fuelType, undefined, { signal: abortController.signal })
        ]);

        if (abortController.signal.aborted) {
          return;
        }

        const nextStations = stationsResult.status === "fulfilled" ? stationsResult.value : [];
        const nextData = {
          stations: nextStations,
          cheapest: sortStationsByPrice(nextStations, fuelType, serviceMode).slice(0, 5),
          statistic: nextStations.length > 0
            ? buildCityFuelStatistic(selectedCity, fuelType, nextStations)
            : statisticResult.status === "fulfilled"
              ? statisticResult.value
              : buildCityFuelStatistic(selectedCity, fuelType, nextStations),
          history: historyResult.status === "fulfilled" ? historyResult.value : []
        };

        dataCacheRef.current.set(requestKey, nextData);
        loadedKeyRef.current = requestKey;
        setVisibleStations(nextData.stations);
        setCheapest(nextData.cheapest);
        setCurrentStatistic(nextData.statistic);
        setCurrentHistory(nextData.history);

        if (stationsResult.status === "rejected") {
          setError(stationsResult.reason instanceof Error ? stationsResult.reason.message : "Impossibile caricare i distributori.");
        }
      } catch (loadError) {
        if (!abortController.signal.aborted) {
          setVisibleStations([]);
          setCheapest([]);
          setError(loadError instanceof Error ? loadError.message : "Impossibile caricare i dati in questo momento.");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadCityData();

    return () => {
      abortController.abort();
    };
  }, [fuelType, isUsingUserPosition, searchVersion, selectedCity, selectedCityId, selectedProvince.id, serviceMode, userPosition]);

  return (
    <>
      {isLoading ? <DataLoadingOverlay /> : null}
      <section className="mx-auto grid max-w-7xl gap-3 px-3 py-3 md:gap-5 md:px-6 md:py-5 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="grid gap-3 md:gap-4">
          <div className="grid gap-3 rounded-md border border-ink/10 bg-white p-3 shadow-sm md:gap-4 md:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-petrol md:text-sm md:normal-case md:tracking-normal">Trova il pieno che fa meno male.</p>
                <h1 className="mt-1 text-xl font-black leading-tight text-ink md:text-4xl">
                  Prezzo {fuelType.toLowerCase()} in provincia di {selectedProvince.name}
                </h1>
              </div>
              <button
                type="button"
                className="grid size-11 shrink-0 place-items-center rounded-md bg-petrol text-white shadow-sm transition hover:bg-[#104955] md:hidden"
                aria-label="Usa la mia posizione"
                onClick={requestUserPosition}
              >
                <LocateFixed size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-2 rounded-md bg-ink/[0.035] p-2.5 md:gap-3 md:p-3 lg:grid-cols-[1.05fr_0.9fr_1.15fr_auto] lg:items-end">
              <div className="grid gap-2 sm:grid-cols-2 lg:contents">
                <ProvinceSelector provinces={provinces} value={selectedProvince.id} onChange={handleProvinceChange} />
                <FuelSelector value={fuelType} onChange={handleFuelChange} />
              </div>
              <ServiceModeSelector value={serviceMode} onChange={setServiceMode} />
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-petrol px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#104955] md:h-12"
                onClick={searchSelectedProvince}
              >
                <Search size={17} aria-hidden="true" />
                Trova
              </button>
              <div className="hidden lg:col-span-4 lg:block">
                <button
                  type="button"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-petrol/20 bg-white px-4 text-sm font-black text-petrol shadow-sm transition hover:border-petrol/45 md:w-auto"
                  onClick={requestUserPosition}
                >
                  <LocateFixed size={17} aria-hidden="true" />
                  Usa la mia posizione
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-ink/62">
              <span className="rounded-md bg-petrol/8 px-2 py-1 text-petrol">{isUsingUserPosition ? "Intorno a te" : selectedProvince.name}</span>
              <span className="rounded-md bg-amber/20 px-2 py-1">{visibleStations.length} distributori</span>
              <span className="rounded-md bg-mint/12 px-2 py-1 text-mint">{serviceMode === "self" ? "Self service" : serviceMode === "served" ? "Servito" : "Miglior prezzo"}</span>
            </div>
            {error ? <p className="rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{error}</p> : null}
          </div>

          {visibleStations.length > 0 ? (
            <DynamicStationMap
              city={selectedCity}
              stations={visibleStations}
              fuelType={fuelType}
              serviceMode={serviceMode}
              averagePrice={currentStatistic.averagePrice}
              userPosition={isUsingUserPosition ? userPosition : null}
              onUserPositionChange={handleUserPositionChange}
            />
          ) : (
            <div className="grid h-[52vh] min-h-[360px] place-items-center rounded-md border border-dashed border-ink/20 bg-white text-center shadow-sm">
              <div>
                <p className="text-lg font-black text-ink">Nessun distributore trovato con questi filtri.</p>
                <button className="mt-3 rounded-md bg-petrol px-4 py-2 font-black text-white" type="button" onClick={() => setFuelType("BENZINA")}>
                  Rimuovi filtri
                </button>
              </div>
            </div>
          )}

          <section className="rounded-md border border-ink/10 bg-white p-3 shadow-sm md:hidden" aria-labelledby="mobile-top-5">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 text-left"
              onClick={() => setMobileRankingOpen((isOpen) => !isOpen)}
              aria-expanded={mobileRankingOpen}
            >
              <span>
                <span id="mobile-top-5" className="inline-flex items-center gap-2 text-base font-black leading-tight text-ink">
                  <Trophy size={20} aria-hidden="true" />
                  {rankingTitle}
                </span>
                <span className="mt-1 block text-xs font-bold text-ink/62">Prezzi ordinati dal piu conveniente</span>
              </span>
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-amber text-ink">
                {mobileRankingOpen ? <ChevronUp size={20} aria-hidden="true" /> : <ChevronDown size={20} aria-hidden="true" />}
              </span>
            </button>
            {mobileRankingOpen ? (
              <div className="mt-4 border-t border-ink/10 pt-4">
                <CheapestStations stations={cheapest} fuelType={fuelType} serviceMode={serviceMode} cityName={selectedCity.name} title={rankingTitle} />
              </div>
            ) : null}
          </section>

          <Link
            className="inline-flex items-center justify-center rounded-md border border-petrol/25 bg-white px-5 py-3 text-sm font-black text-petrol shadow-sm md:hidden"
            href="/segnala-prezzo"
          >
            Segnala un prezzo
          </Link>
        </div>

        <aside className="hidden grid-cols-1 gap-4 lg:grid">
          <StatsCards statistic={currentStatistic} compact />
          <CheapestStations stations={cheapest} fuelType={fuelType} serviceMode={serviceMode} cityName={selectedCity.name} title={rankingTitle} />
        </aside>
      </section>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 pb-8 md:px-6">
        <div className="grid gap-5 lg:hidden">
          <StatsCards statistic={currentStatistic} />
        </div>

        <CitySummary city={selectedCity} statistic={currentStatistic} provinceName={selectedProvince.name} />

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.9fr]">
          <Accordion title="Storico prezzi" defaultOpen>
            <PriceHistoryChart points={currentHistory} fallbackStatistic={currentStatistic} />
          </Accordion>
          <Accordion title="Accise e composizione prezzo" defaultOpen>
            <FuelComposition />
          </Accordion>
        </div>

        <NewsPreview />
      </main>
    </>
  );
}

function DataLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-paper/94 px-6 backdrop-blur-sm" role="status" aria-live="polite">
      <div className="w-full max-w-sm overflow-hidden rounded-md border border-ink/10 bg-white shadow-soft">
        <div className="h-1 bg-petrol/15">
          <div className="route-loading-bar h-full w-1/2 bg-petrol" />
        </div>
        <div className="grid gap-3 p-5 text-center">
          <p className="text-lg font-black text-ink">Caricamento prezzi...</p>
          <p className="text-sm font-bold text-ink/62">Sto aggiornando i prezzi della zona selezionata.</p>
          <div className="mx-auto mt-1 h-4 w-48 animate-pulse rounded-sm bg-ink/10" />
        </div>
      </div>
    </div>
  );
}
