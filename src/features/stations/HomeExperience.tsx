"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, LocateFixed, Trophy } from "lucide-react";
import Link from "next/link";
import { Accordion } from "@/components/Accordion";
import { FuelSelector } from "@/features/filters/FuelSelector";
import { ProvinceSelector } from "@/features/filters/ProvinceSelector";
import { ServiceModeSelector } from "@/features/filters/ServiceModeSelector";
import { DynamicStationMap } from "@/features/map/DynamicStationMap";
import type { LocationStatus, StationFocusRequest } from "@/features/map/StationMap";
import { CheapestStations } from "@/features/stations/CheapestStations";
import { CitySummary } from "@/features/statistics/CitySummary";
import { FuelComposition } from "@/features/statistics/FuelComposition";
import { StatsCards } from "@/features/statistics/StatsCards";
import { NewsPreview } from "@/features/news/NewsPreview";
import { getCityFuelStatistics } from "@/lib/api/statistics";
import { distanceKm, locateUser } from "@/lib/geolocation";
import { intlLocale, type Locale } from "@/lib/i18n";
import { useUrlFilters } from "@/lib/useUrlFilters";
import { getMessages } from "@/lib/messages";
import { getNearbyStations, getStations } from "@/lib/api/stations";
import { buildCityFuelStatistic, buildStatisticFromStations, typicalPrice } from "@/lib/statistics";
import { filterReliableStations, formatLatestUpdate, latestCommunicationTime, sortStationsByPrice } from "@/lib/price";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { City, Province } from "@/types/location";
import type { Station } from "@/types/station";
import type { CityFuelStatistic } from "@/types/statistics";

interface HomeExperienceProps {
  cities: City[];
  provinces: Province[];
  initialCity: City;
  initialProvince: Province;
  stations: Station[];
  statistic: CityFuelStatistic;
  showTitle?: boolean;
  /** Titolo principale (H1) fisso della pagina; se assente l'H1 e' "Prezzo ... in provincia di ...". */
  pageTitle?: string;
  locale?: Locale;
}

interface LoadedCityData {
  stations: Station[];
  statistic: CityFuelStatistic;
}

interface UserPosition {
  latitude: number;
  longitude: number;
}

// Le prime 3 sempre, le altre solo quando c'e' spazio (xl: Firenze e Bologna, 2xl: Torino e Palermo).
const quickProvinceNames = ["Milano", "Roma", "Napoli", "Firenze", "Bologna", "Torino", "Palermo"];

function findProvinceCenter(cities: City[], province: Province, fallbackCity: City): City {
  return (
    cities.find((city) => city.provinceId === province.id && city.name.toLowerCase() === province.name.toLowerCase()) ??
    cities.find((city) => city.provinceId === province.id) ??
    fallbackCity
  );
}


export function HomeExperience({ cities, provinces, initialCity, initialProvince, stations, statistic, showTitle = true, pageTitle, locale = "it" }: HomeExperienceProps) {
  const t = getMessages(locale);
  const intl = intlLocale(locale);
  const [fuelType, setFuelType] = useState<FuelTypeCode>("BENZINA");
  const [serviceMode, setServiceMode] = useState<ServiceMode>("self");
  const [provinceId, setProvinceId] = useState(initialProvince.id);
  const [searchVersion, setSearchVersion] = useState(0);
  const [mobileRankingOpen, setMobileRankingOpen] = useState(true);
  const [visibleStations, setVisibleStations] = useState(stations);
  const [currentStatistic, setCurrentStatistic] = useState(statistic);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locateRequestId, setLocateRequestId] = useState(0);
  const [error, setError] = useState("");
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [focusRequest, setFocusRequest] = useState<StationFocusRequest | null>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const userSelectedProvinceRef = useRef(false);
  const dataCacheRef = useRef(new Map<string, LoadedCityData>());
  const loadedKeyRef = useRef(`province:${initialProvince.id}:0`);

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
  // Sui monitor grandi c'e' spazio per una top 10.
  const isWideScreen = useMediaQuery("(min-width: 1536px)");
  const topCount = isWideScreen ? 10 : 5;
  const rankingTitle = isUsingUserPosition
    ? t.home.rankingNear(topCount)
    : t.home.rankingProvince(selectedProvince.name, topCount);
  // Mappa, classifica, statistiche e conteggi usano gli stessi distributori: prezzi non anomali e
  // comunicati nei 4 giorni prima dell'ultimo aggiornamento disponibile (non di oggi): se MIMIT
  // pubblica in ritardo il sito non si svuota, e server e browser mostrano gli stessi numeri.
  const reliableStations = useMemo(() => {
    const referenceTime = latestCommunicationTime(visibleStations);
    return sortStationsByPrice(filterReliableStations(visibleStations, fuelType, serviceMode, referenceTime), fuelType, serviceMode);
  }, [fuelType, serviceMode, visibleStations]);
  const cheapest = useMemo(() => reliableStations.slice(0, topCount), [reliableStations, topCount]);
  const highlightStationIds = useMemo(() => reliableStations.slice(0, 3).map((station) => station.id), [reliableStations]);
  const displayStatistic = useMemo(
    () =>
      reliableStations.length > 0
        ? buildStatisticFromStations(selectedCity, fuelType, serviceMode, reliableStations)
        : visibleStations.length > 0
          ? buildCityFuelStatistic(selectedCity, fuelType, visibleStations)
          : currentStatistic,
    [currentStatistic, fuelType, reliableStations, selectedCity, serviceMode, visibleStations]
  );

  function handleSelectStation(station: Station) {
    setFocusRequest({
      stationId: station.id,
      latitude: station.latitude,
      longitude: station.longitude,
      requestId: Date.now()
    });

    // Sul telefono la top e' sopra la mappa: scorri fino alla mappa se non e' visibile.
    const mapSection = mapSectionRef.current;
    if (mapSection) {
      const rect = mapSection.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        mapSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  const latestUpdate = useMemo(() => formatLatestUpdate(visibleStations, intl), [intl, visibleStations]);

  const quickProvinces = useMemo(
    () =>
      quickProvinceNames
        .map((provinceName) => provinces.find((province) => province.name.toLowerCase() === provinceName.toLowerCase()))
        .filter((province): province is Province => Boolean(province)),
    [provinces]
  );

  useEffect(() => {
    dataCacheRef.current.set(`province:${initialProvince.id}:0`, {
      stations,
      statistic
    });
  }, [initialProvince.id, statistic, stations]);

  function handleFuelChange(nextFuelType: FuelTypeCode) {
    setFuelType(nextFuelType);

    // GPL e metano sono quasi sempre al servito.
    if (nextFuelType === "GPL" || nextFuelType === "METANO") {
      setServiceMode("served");
    }
  }

  function handleProvinceChange(nextProvinceId: number) {
    userSelectedProvinceRef.current = true;
    setProvinceId(nextProvinceId);
  }

  function selectQuickProvince(nextProvinceId: number) {
    userSelectedProvinceRef.current = true;
    setUserPosition(null);
    setProvinceId(nextProvinceId);
    setSearchVersion((version) => version + 1);
  }

  function requestUserPosition() {
    if (isLocating) {
      return;
    }

    if (!navigator.geolocation) {
      setError(t.location.notSupported);
      return;
    }

    setError("");

    // Se la mappa e' visibile, usa esattamente lo stesso flusso del bottone "Posizione" sulla mappa.
    if (visibleStations.length > 0) {
      setLocateRequestId((requestId) => requestId + 1);
      return;
    }

    // Mappa non montata (nessun distributore): leggi la posizione direttamente.
    setIsLocating(true);
    locateUser({
      onSuccess: (position) => {
        setIsLocating(false);
        setError("");
        handleUserPositionChange(position, true);
      },
      onFailure: (reason) => {
        setIsLocating(false);
        setError(reason === "denied" ? t.location.denied : t.location.unavailable);
      }
    });
  }

  function handleLocationStatusChange(status: LocationStatus) {
    setIsLocating(status === "loading");

    if (status === "ready" || status === "unavailable" || status === "denied") {
      // Richiesta completata: azzera, cosi' se la mappa si rimonta non richiede di nuovo il GPS.
      setLocateRequestId(0);
    }

    if (status === "loading" || status === "ready") {
      setError("");
    }

    if (status === "denied") {
      setError(t.location.denied);
    }

    if (status === "unavailable") {
      setError(t.location.unavailable);
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
    const requestKey = shouldUseUserPosition
      ? `nearby:${userPosition?.latitude.toFixed(4)}:${userPosition?.longitude.toFixed(4)}:${fuelType}:${serviceMode}:${searchVersion}`
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
                  serviceMode,
                  limit: 800
                },
                { signal: abortController.signal }
              )
            : getStations(
                {
                  provinceId: selectedProvince.id,
                  limit: 1500
                },
                { signal: abortController.signal }
              );

        const [stationsResult, statisticResult] = await Promise.allSettled([
          stationsPromise,
          getCityFuelStatistics(selectedCityId, fuelType, { signal: abortController.signal })
        ]);

        if (abortController.signal.aborted) {
          return;
        }

        const nextStations = stationsResult.status === "fulfilled" ? stationsResult.value : [];
        const nextData = {
          stations: nextStations,
          statistic: nextStations.length > 0
            ? buildCityFuelStatistic(selectedCity, fuelType, nextStations)
            : statisticResult.status === "fulfilled"
              ? statisticResult.value
              : buildCityFuelStatistic(selectedCity, fuelType, nextStations)
        };

        dataCacheRef.current.set(requestKey, nextData);
        loadedKeyRef.current = requestKey;
        setVisibleStations(nextData.stations);
        setCurrentStatistic(nextData.statistic);

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

    void loadCityData();

    return () => {
      abortController.abort();
    };
  }, [fuelType, isUsingUserPosition, searchVersion, selectedCity, selectedCityId, selectedProvince.id, serviceMode, userPosition]);

  const summaryLine = [
    isUsingUserPosition ? t.location.aroundYou : null,
    t.home.stationsCount(reliableStations.length),
    latestUpdate ? t.home.pricesUpdatedAt(latestUpdate) : null
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      {isLoading ? <DataLoadingOverlay title={t.home.loadingTitle} text={t.home.loadingText} /> : null}
      <section className="mx-auto grid w-full max-w-[1600px] gap-3 px-3 py-3 md:gap-5 md:px-6 md:py-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_480px]">
        <div className="grid min-w-0 gap-3 md:gap-4">
          <div className="grid gap-3 rounded-md border border-ink/10 bg-white p-3 shadow-sm md:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {showTitle ? (
                  pageTitle ? (
                    <>
                      <h1 className="text-lg font-black leading-tight text-ink md:text-2xl 2xl:text-3xl">{pageTitle}</h1>
                      <p className="mt-1 text-sm font-bold text-ink/62 md:text-base">
                        {t.home.priceInProvince(fuelType, selectedProvince.name)}
                      </p>
                    </>
                  ) : (
                    <h1 className="text-lg font-black leading-tight text-ink md:text-2xl 2xl:text-3xl">
                      {t.home.priceInProvince(fuelType, selectedProvince.name)}
                    </h1>
                  )
                ) : (
                  <p className="text-sm font-black uppercase tracking-[0.08em] text-ink/60">{t.filters.filterTitle}</p>
                )}
                {/* Una sola riga di riepilogo: i filtri scelti sono gia' visibili nei selettori. */}
                <p className="mt-1 text-xs font-bold text-ink/60 md:text-sm">{summaryLine}</p>
              </div>
              <button
                type="button"
                className="grid size-11 shrink-0 place-items-center rounded-md bg-petrol text-white shadow-sm transition hover:bg-[#104955] lg:hidden"
                aria-label={t.location.useMyLocation}
                onClick={requestUserPosition}
                disabled={isLocating}
              >
                <LocateFixed className={isLocating ? "animate-pulse" : undefined} size={20} aria-hidden="true" />
              </button>
            </div>
            {/* I risultati si aggiornano appena cambia un filtro: non serve un bottone "Trova". */}
            <div className="grid gap-2 rounded-md bg-ink/[0.035] p-2.5 md:gap-3 md:p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
              <div className="grid gap-2 sm:grid-cols-2 lg:contents">
                <ProvinceSelector provinces={provinces} value={selectedProvince.id} onChange={handleProvinceChange} locale={locale} />
                <FuelSelector value={fuelType} onChange={handleFuelChange} locale={locale} />
              </div>
              <ServiceModeSelector value={serviceMode} onChange={setServiceMode} locale={locale} />
              <div className="hidden lg:col-span-3 lg:flex lg:flex-wrap lg:items-center lg:gap-2">
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-petrol/20 bg-white px-4 text-sm font-black text-petrol shadow-sm transition hover:border-petrol/45"
                  onClick={requestUserPosition}
                  disabled={isLocating}
                >
                  <LocateFixed className={isLocating ? "animate-pulse" : undefined} size={17} aria-hidden="true" />
                  {isLocating ? t.location.locating : t.location.useMyLocation}
                </button>
                <span className="ml-1 text-xs font-black uppercase tracking-[0.08em] text-ink/60">{t.filters.quick}</span>
                {quickProvinces.map((province, index) => (
                  <button
                    key={province.id}
                    type="button"
                    className={`h-11 rounded-md border px-3 text-sm font-black shadow-sm transition ${
                      index >= 5
                        ? "hidden 2xl:inline-flex 2xl:items-center"
                        : index >= 3
                          ? "hidden xl:inline-flex xl:items-center"
                          : "inline-flex items-center"
                    } ${
                      selectedProvince.id === province.id && !isUsingUserPosition
                        ? "border-petrol bg-petrol text-white"
                        : "border-ink/10 bg-white text-ink/70 hover:border-petrol/35 hover:text-petrol"
                    }`}
                    onClick={() => selectQuickProvince(province.id)}
                  >
                    {province.name}
                  </button>
                ))}
              </div>
            </div>
            {error ? <p className="rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{error}</p> : null}
          </div>

          {/* Telefono e tablet: la classifica viene prima della mappa, e' la risposta a "dove costa meno?". */}
          <section className="rounded-md border border-ink/10 bg-white p-3 shadow-sm lg:hidden" aria-labelledby="mobile-top-5">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 text-left"
              onClick={() => setMobileRankingOpen((isOpen) => !isOpen)}
              aria-expanded={mobileRankingOpen}
            >
              <span className="min-w-0">
                <span id="mobile-top-5" className="flex items-start gap-2 text-base font-black leading-tight text-ink">
                  <Trophy className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
                  <span>{rankingTitle}</span>
                </span>
                <span className="mt-1 block text-xs font-bold text-ink/62">{t.home.rankingSubtitle}</span>
              </span>
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-amber text-ink">
                {mobileRankingOpen ? <ChevronUp size={20} aria-hidden="true" /> : <ChevronDown size={20} aria-hidden="true" />}
              </span>
            </button>
            {mobileRankingOpen ? (
              <div className="mt-4 border-t border-ink/10 pt-4">
                <CheapestStations
                  stations={cheapest}
                  fuelType={fuelType}
                  serviceMode={serviceMode}
                  cityName={selectedCity.name}
                  title={rankingTitle}
                  onSelectStation={handleSelectStation}
                  userPosition={userPosition}
                  showHeader={false}
                  locale={locale}
                />
              </div>
            ) : null}
          </section>

          <div
            ref={mapSectionRef}
            className="h-[54vh] min-h-[360px] scroll-mt-20 sm:h-[60vh] lg:h-[calc(100dvh-8rem)] lg:max-h-[860px] lg:min-h-[480px]"
          >
            {reliableStations.length > 0 ? (
              <DynamicStationMap
                city={selectedCity}
                stations={reliableStations}
                fuelType={fuelType}
                serviceMode={serviceMode}
                referencePrice={typicalPrice(displayStatistic)}
                highlightStationIds={highlightStationIds}
                userPosition={isUsingUserPosition ? userPosition : null}
                locateRequestId={locateRequestId}
                onLocationStatusChange={handleLocationStatusChange}
                onUserPositionChange={(position) => handleUserPositionChange(position, true)}
                focusRequest={focusRequest}
                locale={locale}
              />
            ) : (
              <div className="grid h-full place-items-center rounded-md border border-dashed border-ink/20 bg-white p-4 text-center shadow-sm">
                <div>
                  <p className="text-lg font-black text-ink">{t.home.noStations}</p>
                  <button className="mt-3 rounded-md bg-petrol px-4 py-2 font-black text-white" type="button" onClick={() => setFuelType("BENZINA")}>
                    {t.home.removeFilters}
                  </button>
                </div>
              </div>
            )}
          </div>

          <Link
            className="inline-flex items-center justify-center rounded-md border border-petrol/25 bg-white px-5 py-3 text-sm font-black text-petrol shadow-sm lg:hidden"
            href="/segnala-prezzo"
          >
            {t.home.reportPrice}
          </Link>
        </div>

        <aside className="hidden min-w-0 grid-cols-1 gap-4 lg:grid">
          <StatsCards statistic={displayStatistic} compact locale={locale} />
          <CheapestStations
            stations={cheapest}
            fuelType={fuelType}
            serviceMode={serviceMode}
            cityName={selectedCity.name}
            title={rankingTitle}
            onSelectStation={handleSelectStation}
            userPosition={userPosition}
            locale={locale}
          />
        </aside>
      </section>

      <main className="mx-auto grid w-full max-w-[1600px] gap-5 px-4 pb-8 md:px-6">
        <div className="grid gap-5 lg:hidden">
          <StatsCards statistic={displayStatistic} locale={locale} />
        </div>

        <CitySummary city={selectedCity} statistic={displayStatistic} provinceName={selectedProvince.name} locale={locale} />

        {/* Infografica e notizie sono solo in italiano */}
        {locale === "it" ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_360px] lg:items-start">
            <Accordion title={t.home.exciseAccordion} defaultOpen>
              <FuelComposition />
            </Accordion>
            <NewsPreview vertical />
          </div>
        ) : null}
      </main>
    </>
  );
}

function DataLoadingOverlay({ title, text }: { title: string; text: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 grid place-items-center bg-paper/94 px-6 backdrop-blur-sm" role="status" aria-live="polite">
      <div className="w-full max-w-sm overflow-hidden rounded-md border border-ink/10 bg-white shadow-soft">
        <div className="h-1 bg-petrol/15">
          <div className="route-loading-bar h-full w-1/2 bg-petrol" />
        </div>
        <div className="grid gap-3 p-5 text-center">
          <p className="text-lg font-black text-ink">{title}</p>
          <p className="text-sm font-bold text-ink/62">{text}</p>
          <div className="mx-auto mt-1 h-4 w-48 animate-pulse rounded-sm bg-ink/10" />
        </div>
      </div>
    </div>
  );
}
