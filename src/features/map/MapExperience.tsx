"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Navigation } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { FuelSelector } from "@/features/filters/FuelSelector";
import { ProvinceSelector } from "@/features/filters/ProvinceSelector";
import { ServiceModeSelector } from "@/features/filters/ServiceModeSelector";
import { DynamicStationMap } from "@/features/map/DynamicStationMap";
import type { LocationStatus, StationFocusRequest } from "@/features/map/StationMap";
import { getCityFuelStatistics } from "@/lib/api/statistics";
import { getNearbyStations, getStations } from "@/lib/api/stations";
import { distanceKm } from "@/lib/geolocation";
import { filterReliableStations, formatLatestUpdate, formatPrice, getStationPrice, latestCommunicationTime, sortStationsByPrice } from "@/lib/price";
import { intlLocale, type Locale } from "@/lib/i18n";
import { useUrlFilters } from "@/lib/useUrlFilters";
import { getMessages, type Messages } from "@/lib/messages";
import { buildCityFuelStatistic, buildStatisticFromStations, typicalPrice } from "@/lib/statistics";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
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
  locale?: Locale;
}

interface UserPosition {
  latitude: number;
  longitude: number;
}

interface LoadedMapData {
  stations: Station[];
  statistic: CityFuelStatistic;
}

/** Schede mostrate nella lista prima di "Mostra altri": centinaia di schede rallentano la pagina. */
const LIST_PAGE_SIZE = 50;

function findProvinceCenter(cities: City[], province: Province, fallbackCity: City): City {
  return (
    cities.find((city) => city.provinceId === province.id && city.name.toLowerCase() === province.name.toLowerCase()) ??
    cities.find((city) => city.provinceId === province.id) ??
    fallbackCity
  );
}

function formatSavings(value: number, intl: string): string {
  return new Intl.NumberFormat(intl, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function MapExperience({ cities, provinces, initialCity, initialProvince, stations, statistic, locale = "it" }: MapExperienceProps) {
  const t = getMessages(locale);
  const intl = intlLocale(locale);
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
  const [listLimit, setListLimit] = useState(LIST_PAGE_SIZE);
  const [activeStationId, setActiveStationId] = useState<number | null>(null);
  const [brandFilter, setBrandFilter] = useState("");
  const [sortMode, setSortMode] = useState<"price" | "distance">("price");
  const userSelectedProvinceRef = useRef(false);
  const stationListRef = useRef<HTMLOListElement>(null);
  const dataCacheRef = useRef(new Map<string, LoadedMapData>());
  const loadedKeyRef = useRef(`province:${initialProvince.id}:0`);

  const selectedProvince = useMemo(
    () => provinces.find((province) => province.id === provinceId) ?? initialProvince,
    [initialProvince, provinceId, provinces]
  );
  const selectedCity = useMemo(
    () => findProvinceCenter(cities, selectedProvince, initialCity),
    [cities, initialCity, selectedProvince]
  );
  const isUsingUserPosition = Boolean(userPosition) && !userSelectedProvinceRef.current;
  const listTitle = isUsingUserPosition ? t.map.listNear(fuelType) : t.map.listProvince(fuelType, selectedProvince.name);

  const [focusRequest, setFocusRequest] = useState<StationFocusRequest | null>(null);
  const mapCanvasRef = useRef<HTMLDivElement>(null);

  // Mappa, classifica, statistiche e conteggi usano gli stessi distributori: prezzi non anomali e
  // comunicati nei 4 giorni prima dell'ultimo aggiornamento disponibile (non di oggi): se MIMIT
  // pubblica in ritardo il sito non si svuota, e server e browser mostrano gli stessi numeri.
  const orderedStations = useMemo(() => {
    const referenceTime = latestCommunicationTime(visibleStations);
    return sortStationsByPrice(filterReliableStations(visibleStations, fuelType, serviceMode, referenceTime), fuelType, serviceMode);
  }, [fuelType, serviceMode, visibleStations]);
  // Marchi presenti nei risultati, dal piu' diffuso.
  const brandOptions = useMemo(() => {
    const counts = new Map<string, number>();
    orderedStations.forEach((station) => counts.set(station.brand.trim(), (counts.get(station.brand.trim()) ?? 0) + 1));
    return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "it"));
  }, [orderedStations]);
  const brandStations = useMemo(
    () => (brandFilter ? orderedStations.filter((station) => station.brand.trim() === brandFilter) : orderedStations),
    [brandFilter, orderedStations]
  );
  // Distanza: quella calcolata dal server per "vicino a te", altrimenti in linea d'aria dalla posizione.
  const distanceFrom = useCallback(
    (station: Station) => station.distanceKm ?? (userPosition ? distanceKm(userPosition, station) : undefined),
    [userPosition]
  );
  const canSortByDistance = isUsingUserPosition && Boolean(userPosition);
  const sortedStations = useMemo(
    () =>
      canSortByDistance && sortMode === "distance"
        ? [...brandStations].sort((left, right) => (distanceFrom(left) ?? Infinity) - (distanceFrom(right) ?? Infinity))
        : brandStations,
    [brandStations, canSortByDistance, distanceFrom, sortMode]
  );
  const listedStations = useMemo(() => sortedStations.slice(0, listLimit), [listLimit, sortedStations]);
  const highlightStationIds = useMemo(() => brandStations.slice(0, 3).map((station) => station.id), [brandStations]);
  const displayStatistic = useMemo(
    () =>
      orderedStations.length > 0
        ? buildStatisticFromStations(selectedCity, fuelType, serviceMode, orderedStations)
        : visibleStations.length > 0
          ? buildCityFuelStatistic(selectedCity, fuelType, visibleStations)
          : currentStatistic,
    [currentStatistic, fuelType, orderedStations, selectedCity, serviceMode, visibleStations]
  );

  function handleSelectStation(station: Station) {
    setActiveStationId(station.id);
    setFocusRequest({
      stationId: station.id,
      latitude: station.latitude,
      longitude: station.longitude,
      requestId: Date.now()
    });

    // Sul telefono la lista e' sotto la mappa: riporta la mappa in vista.
    const mapCanvas = mapCanvasRef.current;
    if (mapCanvas) {
      const rect = mapCanvas.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        mapCanvas.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  // Quando cambiano i risultati (nuova provincia, "Posizionami", filtri) riporta la lista in cima,
  // altrimenti resta scorsa dove si trovava e la nuova "top" dei prezzi non si vede.
  useEffect(() => {
    stationListRef.current?.scrollTo({ top: 0, left: 0 });
    setListLimit(LIST_PAGE_SIZE);
    setActiveStationId(null);
  }, [sortedStations]);

  // Nuova zona: il marchio scelto potrebbe non esserci piu'.
  useEffect(() => {
    setBrandFilter("");
  }, [visibleStations]);

  // Carosello su telefono/tablet: la scheda al centro dello schermo evidenzia il suo distributore sulla mappa.
  useEffect(() => {
    const list = stationListRef.current;
    if (!list || window.matchMedia("(min-width: 1024px)").matches) {
      return;
    }

    let timer = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        const stationId = Number((visible?.target as HTMLElement | undefined)?.dataset.stationId);
        if (!stationId) {
          return;
        }
        window.clearTimeout(timer);
        // Aspetta che lo scorrimento si fermi: niente mappa che "insegue" ogni scheda.
        timer = window.setTimeout(() => setActiveStationId(stationId), 250);
      },
      { root: list, threshold: [0.6] }
    );
    list.querySelectorAll<HTMLElement>("[data-station-id]").forEach((item) => observer.observe(item));

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [listedStations]);

  function handleLocationStatusChange(status: LocationStatus) {
    if (status === "loading" || status === "ready") {
      setLocationError("");
    } else if (status === "denied") {
      setLocationError(t.location.denied);
    } else if (status === "unavailable") {
      setLocationError(t.location.unavailable);
    }
  }
  const latestUpdate = useMemo(() => formatLatestUpdate(visibleStations, intl), [intl, visibleStations]);
  const cheapestPrice = brandStations.length > 0 ? getStationPrice(brandStations[0], fuelType, serviceMode)?.price : undefined;
  // Rispetto al prezzo tipico (mediana), non alla media: pochi distributori carissimi non gonfiano il risparmio.
  const savingOnTank = cheapestPrice ? Math.max(0, (typicalPrice(displayStatistic) - cheapestPrice) * 50) : 0;
  const filtersSummary = [t.fuelName[fuelType], t.serviceMode[serviceMode], latestUpdate ? t.home.pricesUpdatedAt(latestUpdate) : null]
    .filter(Boolean)
    .join(" · ");

  useEffect(() => {
    dataCacheRef.current.set(`province:${initialProvince.id}:0`, {
      stations,
      statistic
    });
  }, [initialProvince.id, stations, statistic]);

  function handleFuelChange(nextFuelType: FuelTypeCode) {
    setFuelType(nextFuelType);
    // GPL e metano sono quasi sempre al servito.
    if (nextFuelType === "GPL" || nextFuelType === "METANO") {
      setServiceMode("served");
    }
  }

  useUrlFilters({
    provinces,
    initialProvinceId: initialProvince.id,
    provinceId: selectedProvince.id,
    fuelType,
    serviceMode,
    includeProvince: !isUsingUserPosition,
    onRead: (filters) => {
      if (filters.provinceId) {
        userSelectedProvinceRef.current = true;
        setProvinceId(filters.provinceId);
      }
      if (filters.fuelType) {
        handleFuelChange(filters.fuelType);
      }
      if (filters.serviceMode) {
        setServiceMode(filters.serviceMode);
      }
    }
  });

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
    // Per provincia arrivano tutti i prezzi: cambiare carburante o modalita' filtra in locale, senza ricaricare.
    const requestKey =
      shouldUseUserPosition && userPosition
        ? `nearby:${userPosition.latitude.toFixed(4)}:${userPosition.longitude.toFixed(4)}:${fuelType}:${serviceMode}:${searchVersion}`
        : `province:${selectedProvince.id}:${searchVersion}`;

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
          setError(stationsResult.reason instanceof Error ? stationsResult.reason.message : t.home.loadStationsError);
        }
      } catch (loadError) {
        if (!abortController.signal.aborted) {
          setVisibleStations([]);
          setError(loadError instanceof Error ? loadError.message : t.home.loadDataError);
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

  const remaining = sortedStations.length - listedStations.length;
  const rightColumn = "lg:col-start-2 lg:border-l lg:border-ink/10";

  return (
    // Telefono: titolo, mappa, risparmio e carosello uno sotto l'altro.
    // Desktop: mappa a sinistra a tutta altezza, titolo + risparmio + lista a destra.
    <section className="grid min-h-[calc(100dvh-65px)] min-w-0 bg-[#eef2ee] lg:h-[calc(100dvh-65px)] lg:grid-cols-[minmax(0,1fr)_420px] lg:grid-rows-[auto_auto_minmax(0,1fr)] lg:overflow-hidden 2xl:grid-cols-[minmax(0,1fr)_480px]">
      <header className={`border-b border-ink/10 bg-white px-3 py-3 lg:row-start-1 lg:p-4 ${rightColumn}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 id="map-results-title" className="text-lg font-black leading-tight text-ink lg:text-xl">
              {listTitle}
            </h1>
            <p className="mt-0.5 text-xs font-bold text-ink/58">{filtersSummary}</p>
          </div>
          <span className="shrink-0 rounded-md bg-ink/[0.045] px-3 py-2 text-sm font-black text-ink">{t.map.stationsBadge(brandStations.length)}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{t.map.brand}</span>
            <select
              className="h-10 w-full min-w-0 appearance-none truncate rounded-md border border-ink/10 bg-white pl-3 pr-8 text-sm font-bold text-ink shadow-sm transition hover:border-petrol/35"
              value={brandFilter}
              onChange={(event) => setBrandFilter(event.target.value)}
            >
              <option value="">{t.map.allBrands}</option>
              {brandOptions.map(([brand, count]) => (
                <option key={brand} value={brand}>
                  {brand} ({count})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/60" size={16} aria-hidden="true" />
          </label>
          {canSortByDistance ? (
            <div className="grid shrink-0 grid-cols-2 rounded-md border border-ink/10 bg-white p-0.5 shadow-sm" role="group" aria-label={t.map.sortBy}>
              {(["price", "distance"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={sortMode === mode}
                  className={`h-9 rounded-[5px] px-3 text-xs font-black transition sm:text-sm ${
                    sortMode === mode ? "bg-petrol text-white" : "text-ink/68 hover:bg-petrol/8 hover:text-petrol"
                  }`}
                  onClick={() => setSortMode(mode)}
                >
                  {mode === "price" ? t.map.sortPrice : t.map.sortDistance}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <div ref={mapCanvasRef} className="relative min-w-0 scroll-mt-16 map-experience__canvas lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:min-h-0">
        <MapFilters
          fuelType={fuelType}
          onFuelChange={handleFuelChange}
          onProvinceChange={(nextProvinceId) => {
            userSelectedProvinceRef.current = true;
            setProvinceId(nextProvinceId);
          }}
          onServiceModeChange={setServiceMode}
          provinces={provinces}
          selectedProvinceId={selectedProvince.id}
          serviceMode={serviceMode}
          locale={locale}
        />
        <div className="map-experience__leaflet w-full min-w-0">
          <DynamicStationMap
            city={selectedCity}
            stations={brandStations}
            fuelType={fuelType}
            serviceMode={serviceMode}
            referencePrice={typicalPrice(displayStatistic)}
            highlightStationIds={highlightStationIds}
            activeStationId={activeStationId}
            userPosition={isUsingUserPosition ? userPosition : null}
            locationLoading={isUsingUserPosition && isLoading}
            onUserPositionChange={(position) => handleUserPositionChange(position, true)}
            onLocationStatusChange={handleLocationStatusChange}
            focusRequest={focusRequest}
            // Su desktop la pagina non scorre: la rotella puo' zoomare subito.
            guardWheel={false}
            className="h-full w-full min-w-0 overflow-hidden border-y border-ink/10 bg-white lg:border-0"
            locale={locale}
          />
        </div>
      </div>

      {/* Senza distributori (o senza differenza di prezzo) il "risparmio di 0,00 €" non dice nulla. */}
      {savingOnTank >= 0.01 ? (
        <div className={`bg-mint px-4 py-3 text-sm font-black text-white lg:row-start-2 ${rightColumn}`}>
          {t.map.savings(formatSavings(savingOnTank, intl))}
        </div>
      ) : null}

      <div className={`flex min-h-0 min-w-0 flex-col bg-white lg:row-start-3 ${rightColumn}`}>
        {locationError ? <p className="m-3 rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{locationError}</p> : null}
        {error ? <p className="m-3 rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{error}</p> : null}

        <h2 className="sr-only">{t.map.listHeading}</h2>
        <ol
          ref={stationListRef}
          aria-labelledby="map-results-title"
          className="map-station-carousel flex w-full min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-3 py-3 lg:grid lg:flex-1 lg:auto-rows-min lg:gap-0 lg:overflow-x-hidden lg:overflow-y-auto lg:px-0 lg:py-0"
        >
          {listedStations.length > 0 ? (
            <>
              {listedStations.map((station, index) => (
                <MapStationCard
                  key={station.id}
                  station={station}
                  index={index}
                  fuelType={fuelType}
                  serviceMode={serviceMode}
                  isActive={station.id === activeStationId}
                  distance={distanceFrom(station)}
                  onSelect={handleSelectStation}
                  t={t}
                  intl={intl}
                />
              ))}
              {remaining > 0 ? (
                <li className="grid w-[min(60vw,240px)] shrink-0 snap-center place-items-center lg:w-auto lg:p-4">
                  <button
                    type="button"
                    className="inline-flex h-11 items-center gap-2 rounded-md border border-petrol/25 bg-white px-4 text-sm font-black text-petrol shadow-sm transition hover:border-petrol/45"
                    onClick={() => setListLimit((limit) => limit + LIST_PAGE_SIZE)}
                  >
                    <ChevronDown size={17} aria-hidden="true" />
                    {t.map.showMore(Math.min(LIST_PAGE_SIZE, remaining))}
                  </button>
                </li>
              ) : null}
            </>
          ) : (
            <li className="min-w-[82vw] rounded-md border border-dashed border-ink/20 bg-white p-5 text-sm font-bold text-ink/66 lg:m-4 lg:min-w-0">
              {t.map.emptyList}
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}

/** Stessi filtri della home, in versione compatta sopra la mappa. Si applicano appena cambiano. */
function MapFilters({
  fuelType,
  onFuelChange,
  onProvinceChange,
  onServiceModeChange,
  provinces,
  selectedProvinceId,
  serviceMode,
  locale
}: {
  fuelType: FuelTypeCode;
  onFuelChange: (fuelType: FuelTypeCode) => void;
  onProvinceChange: (provinceId: number) => void;
  onServiceModeChange: (mode: ServiceMode) => void;
  provinces: Province[];
  selectedProvinceId: number;
  serviceMode: ServiceMode;
  locale: Locale;
}) {
  return (
    <div className="absolute left-3 right-3 top-3 z-[650] grid gap-2 sm:left-4 sm:right-auto sm:w-[min(760px,calc(100%-2rem))] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
      <div className="grid grid-cols-2 gap-2 md:contents">
        <FuelSelector value={fuelType} onChange={onFuelChange} locale={locale} variant="compact" />
        <ProvinceSelector provinces={provinces} value={selectedProvinceId} onChange={onProvinceChange} locale={locale} variant="compact" />
      </div>
      <ServiceModeSelector value={serviceMode} onChange={onServiceModeChange} locale={locale} variant="compact" />
    </div>
  );
}

function MapStationCard({
  fuelType,
  index,
  isActive,
  distance,
  onSelect,
  serviceMode,
  station,
  t,
  intl
}: {
  fuelType: FuelTypeCode;
  index: number;
  isActive: boolean;
  distance?: number;
  onSelect: (station: Station) => void;
  serviceMode: ServiceMode;
  station: Station;
  t: Messages;
  intl: string;
}) {
  const price = getStationPrice(station, fuelType, serviceMode);

  return (
    <li
      data-station-id={station.id}
      className={`map-station-carousel__item w-[min(82vw,360px)] min-w-0 shrink-0 cursor-pointer snap-center border bg-white p-4 shadow-sm transition hover:bg-petrol/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-petrol lg:w-auto lg:shrink lg:snap-none lg:border-x-0 lg:border-t-0 lg:shadow-none ${
        isActive ? "border-petrol bg-petrol/[0.04] lg:border-l-4 lg:border-l-petrol" : "border-ink/10"
      }`}
      onClick={() => onSelect(station)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(station);
        }
      }}
      tabIndex={0}
      title={t.cheapest.showOnMap}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-petrol">#{index + 1}</p>
          <p className="mt-1 line-clamp-2 text-lg font-black leading-tight text-ink">{station.name}</p>
          <p className="mt-1 line-clamp-2 text-sm text-ink/68">
            {station.address} {station.cityName ? `${station.cityName} (${station.provinceName})` : ""}
          </p>
        </div>
        <BrandLogo brand={station.brand} compact />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {price ? (
          <span className="rounded-md bg-ink/[0.045] px-2 py-1 text-xs font-bold text-ink/62">
            {t.map.updatedOn(new Intl.DateTimeFormat(intl, { day: "numeric", month: "short" }).format(new Date(price.communicatedAt)))}
          </span>
        ) : null}
        {distance !== undefined ? <span className="rounded-md bg-petrol/10 px-2 py-1 text-xs font-bold text-petrol">{distance.toFixed(1)} km</span> : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <a
          className="grid size-11 place-items-center rounded-md bg-[#0b5ca8] text-white transition hover:bg-[#084b89] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b5ca8]"
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
          target="_blank"
          rel="noreferrer"
          aria-label={t.map.routeAria(station.name)}
          title={t.map.routeTitle}
          onClick={(event) => event.stopPropagation()}
        >
          <Navigation size={20} aria-hidden="true" />
        </a>
        <p className="rounded-md bg-mint px-3 py-2 text-xl font-black leading-none text-white shadow-sm">
          {price ? formatPrice(price.price, intl) : "-"}
          <span className="ml-1 text-xs">€/L</span>
        </p>
      </div>
    </li>
  );
}
