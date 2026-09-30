"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, MapPin, Search, Send, Store } from "lucide-react";
import { createPriceReport } from "@/lib/api/reports";
import { getStations } from "@/lib/api/stations";
import type { FuelTypeCode } from "@/types/fuel";
import { FUEL_TYPES } from "@/types/fuel";
import type { City } from "@/types/location";
import type { Station } from "@/types/station";

interface PriceReportFormProps {
  cities: City[];
  initialCity?: City;
  stations: Station[];
  initialStationId?: number;
  initialFuelType?: FuelTypeCode;
  initialSelfService?: boolean;
}

function normalizePriceInput(value: string): string {
  const cleanValue = value.replace(",", ".").replace(/[^\d.]/g, "");

  if (/^\d{4}$/.test(cleanValue)) {
    return `${cleanValue.slice(0, 1)}.${cleanValue.slice(1)}`;
  }

  const [integerPart, decimalPart = ""] = cleanValue.split(".");
  const safeInteger = integerPart.slice(0, 1);
  const safeDecimals = decimalPart.replace(/\D/g, "").slice(0, 3);

  if (!safeInteger) {
    return "";
  }

  return safeDecimals ? `${safeInteger}.${safeDecimals}` : safeInteger;
}

function parsePrice(value: string): number | null {
  const normalized = normalizePriceInput(value);

  if (!/^\d\.\d{3}$/.test(normalized)) {
    return null;
  }

  const parsedPrice = Number(normalized);

  if (!Number.isFinite(parsedPrice) || parsedPrice < 0.5 || parsedPrice > 3.5) {
    return null;
  }

  return parsedPrice;
}

export function PriceReportForm({ cities, initialCity, stations, initialStationId, initialFuelType = "BENZINA", initialSelfService = true }: PriceReportFormProps) {
  const initialProvinceId = initialCity?.provinceId ?? cities[0]?.provinceId ?? 0;
  const [provinceId, setProvinceId] = useState(initialProvinceId);
  const [cityId, setCityId] = useState(initialCity?.id ?? cities[0]?.id ?? 0);
  const [citySearch, setCitySearch] = useState(initialCity?.name ?? cities[0]?.name ?? "");
  const [stationSearch, setStationSearch] = useState("");
  const [availableStations, setAvailableStations] = useState(stations);
  const [stationId, setStationId] = useState(initialStationId ?? stations[0]?.id ?? 0);
  const [preferredStationId, setPreferredStationId] = useState(initialStationId ?? 0);
  const [fuelTypeCode, setFuelTypeCode] = useState<FuelTypeCode>(initialFuelType);
  const [price, setPrice] = useState("");
  const [selfService, setSelfService] = useState(initialSelfService);
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [error, setError] = useState("");
  const [stationError, setStationError] = useState("");
  const [priceError, setPriceError] = useState("");
  const stationListRef = useRef<HTMLDivElement>(null);

  const selectedStation = useMemo(
    () => availableStations.find((station) => station.id === stationId) ?? availableStations[0],
    [availableStations, stationId]
  );
  const provinces = useMemo(() => {
    const byId = new Map<number, string>();
    cities.forEach((city) => byId.set(city.provinceId, city.provinceName));

    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((left, right) => left.name.localeCompare(right.name, "it"));
  }, [cities]);
  const provinceCities = useMemo(
    () => cities.filter((city) => city.provinceId === provinceId).sort((left, right) => left.name.localeCompare(right.name, "it")),
    [cities, provinceId]
  );
  const filteredCities = useMemo(() => {
    const query = citySearch.trim().toLowerCase();
    const source = provinceCities.length > 0 ? provinceCities : cities;
    const matches = query.length < 2 ? source.slice(0, 8) : source.filter((city) => city.name.toLowerCase().includes(query));
    const selectedCity = cities.find((city) => city.id === cityId);
    const visibleCities = selectedCity && !matches.some((city) => city.id === selectedCity.id) ? [selectedCity, ...matches] : matches;

    return visibleCities.slice(0, 10);
  }, [cities, cityId, citySearch, provinceCities]);
  const filteredStations = useMemo(() => {
    const query = stationSearch.trim().toLowerCase();

    if (!query) {
      return availableStations;
    }

    return availableStations.filter((station) =>
      [station.brand, station.name, station.address, station.cityName].some((value) => value.toLowerCase().includes(query))
    );
  }, [availableStations, stationSearch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryFuelType = params.get("fuelType");
    const querySelfService = params.get("selfService");
    const queryCityId = Number(params.get("cityId"));
    const queryStationId = Number(params.get("stationId"));
    const queryPrice = params.get("price");

    if (queryFuelType && FUEL_TYPES.some((fuel) => fuel.code === queryFuelType)) {
      setFuelTypeCode(queryFuelType as FuelTypeCode);
    }

    if (querySelfService === "true" || querySelfService === "false") {
      setSelfService(querySelfService === "true");
    }

    if (queryStationId) {
      setPreferredStationId(queryStationId);
      setStationId(queryStationId);
    }

    if (queryPrice) {
      const normalizedPrice = normalizePriceInput(queryPrice);
      setPrice(normalizedPrice);
      setPriceError(normalizedPrice && parsePrice(normalizedPrice) === null ? "Controlla il prezzo prima di inviare." : "");
    }

    if (queryCityId) {
      const queryCity = cities.find((city) => city.id === queryCityId);

      if (queryCity) {
        setProvinceId(queryCity.provinceId);
        setCityId(queryCity.id);
        setCitySearch(queryCity.name);
      }
    }
  }, [cities]);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadStations() {
      if (!cityId) {
        setAvailableStations([]);
        setStationId(0);
        return;
      }

      setIsLoadingStations(true);
      setStationError("");

      try {
        const nextStations = await getStations({ cityId, fuelType: fuelTypeCode, serviceMode: "all" }, { signal: abortController.signal });

        if (!abortController.signal.aborted) {
          const nextStationId = preferredStationId && nextStations.some((station) => station.id === preferredStationId) ? preferredStationId : nextStations[0]?.id ?? 0;

          setAvailableStations(nextStations);
          setStationId(nextStationId);
          setStationSearch("");
        }
      } catch (loadError) {
        if (!abortController.signal.aborted) {
          setAvailableStations([]);
          setStationId(0);
          setStationError(loadError instanceof Error ? loadError.message : "Impossibile caricare i distributori per questa città.");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingStations(false);
        }
      }
    }

    void loadStations();

    return () => {
      abortController.abort();
    };
  }, [cityId, fuelTypeCode, preferredStationId]);

  useEffect(() => {
    if (isLoadingStations || !stationId) {
      return;
    }

    const selectedStationButton = stationListRef.current?.querySelector<HTMLButtonElement>(`[data-station-id="${stationId}"]`);
    selectedStationButton?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [isLoadingStations, stationId, filteredStations]);

  function handleCitySelect(nextCityId: number) {
    const nextCity = cities.find((city) => city.id === nextCityId);
    if (!nextCity) {
      return;
    }

    setProvinceId(nextCity.provinceId);
    setCityId(nextCityId);
    setCitySearch(nextCity.name);
    setPreferredStationId(0);
  }

  function handleProvinceSelect(nextProvinceId: number) {
    setProvinceId(nextProvinceId);
    const firstCity = cities.find((city) => city.provinceId === nextProvinceId);

    if (firstCity) {
      setCityId(firstCity.id);
      setCitySearch(firstCity.name);
      setPreferredStationId(0);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStation) {
      return;
    }

    const parsedPrice = parsePrice(price);

    if (parsedPrice === null) {
      setPriceError("Inserisci il prezzo con tre decimali, per esempio 2.123.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setPriceError("");

    try {
      await createPriceReport({
        stationId: selectedStation.id,
        stationName: selectedStation.name,
        brand: selectedStation.brand,
        cityName: selectedStation.cityName,
        fuelTypeCode,
        price: parsedPrice,
        selfService,
        reporterName: reporterName || undefined,
        reporterEmail: reporterEmail || undefined,
        note: note || undefined
      });

      setSubmitted(true);
      setPrice("");
      setNote("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Invio segnalazione non riuscito.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-md border border-ink/10 bg-white p-4 shadow-sm md:p-6" aria-labelledby="segnala-prezzo">
      <div className="grid gap-2">
        <p className="text-sm font-black text-petrol">Segnalazione pubblica</p>
        <h1 id="segnala-prezzo" className="text-2xl font-black leading-tight text-ink md:text-4xl">
          Aggiungi il prezzo di un benzinaio
        </h1>
        <p className="max-w-3xl text-ink/68">
          La segnalazione resta in attesa: prima di comparire sul sito deve essere approvata dall&apos;admin.
        </p>
      </div>

      {submitted ? (
        <div className="mt-5 flex items-start gap-3 rounded-md border border-mint/20 bg-mint/10 p-4 text-mint">
          <CheckCircle2 size={22} aria-hidden="true" />
          <div>
            <p className="font-black">Segnalazione inviata</p>
            <p className="text-sm text-ink/70">Ora e in coda di approvazione. Nessun prezzo viene pubblicato automaticamente.</p>
          </div>
        </div>
      ) : null}
      {error ? <p className="mt-5 rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{error}</p> : null}

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 rounded-md border border-ink/10 bg-paper p-3">
          <div className="grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
            <label className="grid gap-2">
              <span className="text-sm font-black text-ink">Provincia</span>
              <span className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-petrol" size={17} aria-hidden="true" />
                <select
                  className="h-12 w-full rounded-md border border-ink/10 bg-white pl-10 pr-3 text-base font-bold"
                  value={provinceId}
                  onChange={(event) => handleProvinceSelect(Number(event.target.value))}
                >
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-ink">Comune</span>
              <span className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/60" size={17} aria-hidden="true" />
                <input
                  className="h-12 w-full rounded-md border border-ink/10 bg-white pl-10 pr-3 text-base"
                  value={citySearch}
                  onChange={(event) => setCitySearch(event.target.value)}
                  placeholder="Cerca comune, es. Milano"
                />
              </span>
            </label>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {filteredCities.map((city) => (
              <button
                key={city.id}
                type="button"
                className={`shrink-0 rounded-md border px-3 py-2 text-left text-sm font-black transition ${
                  city.id === cityId ? "border-petrol bg-petrol text-white" : "border-ink/10 bg-white text-ink hover:border-petrol/35"
                }`}
                onClick={() => handleCitySelect(city.id)}
              >
                {city.name}
                <span className={`block text-xs font-bold ${city.id === cityId ? "text-white/76" : "text-ink/60"}`}>{city.provinceName}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-[0.9fr_1fr_1.1fr]">
          <label className="grid content-start gap-2">
            <span className="flex min-h-5 items-center text-sm font-black text-ink">Carburante</span>
            <select
              className="h-12 rounded-md border border-ink/10 bg-white px-3"
              value={fuelTypeCode}
              onChange={(event) => {
                const nextFuelType = event.target.value as FuelTypeCode;
                setFuelTypeCode(nextFuelType);

                if (nextFuelType === "GPL" || nextFuelType === "METANO") {
                  setSelfService(false);
                }
              }}
            >
              {FUEL_TYPES.map((fuel) => (
                <option key={fuel.code} value={fuel.code}>
                  {fuel.name}
                </option>
              ))}
            </select>
            <span className="min-h-8" aria-hidden="true" />
          </label>

          <label className="grid content-start gap-2">
            <span className="flex min-h-5 items-center text-sm font-black text-ink">Prezzo</span>
            <input
              className={`h-12 rounded-md border px-3 text-lg font-black tabular-nums ${priceError ? "border-tomato bg-tomato/5" : "border-ink/10"}`}
              inputMode="decimal"
              placeholder="2.123"
              value={price}
              onChange={(event) => {
                setPrice(event.target.value.replace(/[^\d.,]/g, "").slice(0, 5));
                setPriceError("");
              }}
              onBlur={() => {
                const normalizedPrice = normalizePriceInput(price);
                setPrice(normalizedPrice);
                setPriceError(normalizedPrice && parsePrice(normalizedPrice) === null ? "Usa il formato 2.123, con tre decimali." : "");
              }}
              required
            />
            <span className={`text-xs font-bold ${priceError ? "text-tomato" : "text-ink/60"}`}>
              {priceError || "Esempio: scrivi 2123 oppure 2.123, lo sistemiamo noi."}
            </span>
          </label>

          <fieldset className="grid min-w-0 content-start gap-2 md:col-span-2 lg:col-span-1">
            <legend className="flex min-h-5 items-center text-sm font-black text-ink">Modalità</legend>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={selfService}
                className={`h-12 min-w-0 rounded-md border px-2 text-sm font-black sm:text-base ${selfService ? "border-mint bg-mint text-white" : "border-ink/10 bg-white"}`}
                onClick={() => setSelfService(true)}
              >
                Self
              </button>
              <button
                type="button"
                aria-pressed={!selfService}
                className={`h-12 min-w-0 rounded-md border px-2 text-sm font-black sm:text-base ${!selfService ? "border-mint bg-mint text-white" : "border-ink/10 bg-white"}`}
                onClick={() => setSelfService(false)}
              >
                Servito
              </button>
            </div>
            <span className="min-h-8" aria-hidden="true" />
          </fieldset>
        </div>

        <div className="grid gap-3 rounded-md border border-ink/10 bg-paper p-3">
          <label className="grid gap-2">
            <span className="flex items-center justify-between gap-3 text-sm font-black text-ink">
              Benzinaio
              {isLoadingStations ? <span className="font-bold text-ink/60">Carico...</span> : <span className="font-bold text-ink/60">{availableStations.length} trovati</span>}
            </span>
            <span className="relative">
              <Store className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-petrol" size={17} aria-hidden="true" />
              <input
                className="h-12 w-full rounded-md border border-ink/10 bg-white pl-10 pr-3 text-base disabled:bg-ink/[0.04]"
                value={stationSearch}
                onChange={(event) => setStationSearch(event.target.value)}
                disabled={isLoadingStations || availableStations.length === 0}
                placeholder="Cerca per nome, marca o indirizzo"
              />
            </span>
          </label>

          <div ref={stationListRef} className="grid max-h-72 scroll-py-4 gap-2 overflow-y-auto pr-1">
            {isLoadingStations ? (
              Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-md bg-white/80" />
              ))
            ) : (
              filteredStations.map((station) => (
                <button
                  key={station.id}
                  data-station-id={station.id}
                  type="button"
                  className={`rounded-md border bg-white p-3 text-left transition ${
                    station.id === stationId ? "border-petrol bg-petrol/5 ring-2 ring-petrol/18" : "border-ink/10 hover:border-petrol/35"
                  }`}
                  onClick={() => setStationId(station.id)}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate font-black text-ink">{station.brand} - {station.name}</span>
                      <span className="mt-1 block text-sm text-ink/62">{station.address}</span>
                      <span className="mt-1 block text-xs font-bold text-petrol">{station.cityName}</span>
                      {station.id === stationId ? <span className="mt-2 inline-flex rounded-md bg-petrol px-2 py-1 text-xs font-black text-white">Selezionato</span> : null}
                    </span>
                    <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${station.id === stationId ? "border-petrol bg-petrol" : "border-ink/20"}`}>
                      {station.id === stationId ? <span className="size-2 rounded-full bg-white" /> : null}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          {stationError ? <span className="text-sm font-bold text-tomato">{stationError}</span> : null}
          {!isLoadingStations && availableStations.length === 0 && !stationError ? (
            <span className="text-sm font-bold text-ink/58">Nessun distributore trovato per questa città e carburante.</span>
          ) : null}
          {!isLoadingStations && availableStations.length > 0 && filteredStations.length === 0 ? (
            <span className="text-sm font-bold text-ink/58">Nessun distributore corrisponde alla ricerca.</span>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-black text-ink">Nome (opzionale)</span>
            <input className="h-12 rounded-md border border-ink/10 px-3" value={reporterName} onChange={(event) => setReporterName(event.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black text-ink">Email (opzionale)</span>
            <input
              className="h-12 rounded-md border border-ink/10 px-3"
              type="email"
              value={reporterEmail}
              onChange={(event) => setReporterEmail(event.target.value)}
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-black text-ink">Nota (opzionale)</span>
          <textarea
            className="min-h-28 rounded-md border border-ink/10 p-3"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Esempio: prezzo visto sul tabellone, foto disponibile, orario..."
          />
        </label>

        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-petrol px-5 font-black text-white disabled:opacity-60 md:w-fit"
          type="submit"
          disabled={isSubmitting || !selectedStation}
        >
          <Send size={18} aria-hidden="true" />
          {isSubmitting ? "Invio..." : "Invia per approvazione"}
        </button>
      </form>
    </section>
  );
}
