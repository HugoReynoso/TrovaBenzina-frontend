"use client";

import { useEffect, useMemo, useState } from "react";
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
}

export function PriceReportForm({ cities, initialCity, stations }: PriceReportFormProps) {
  const initialProvinceId = initialCity?.provinceId ?? cities[0]?.provinceId ?? 0;
  const [provinceId, setProvinceId] = useState(initialProvinceId);
  const [cityId, setCityId] = useState(initialCity?.id ?? cities[0]?.id ?? 0);
  const [citySearch, setCitySearch] = useState(initialCity?.name ?? cities[0]?.name ?? "");
  const [stationSearch, setStationSearch] = useState("");
  const [availableStations, setAvailableStations] = useState(stations);
  const [stationId, setStationId] = useState(stations[0]?.id ?? 0);
  const [fuelTypeCode, setFuelTypeCode] = useState<FuelTypeCode>("BENZINA");
  const [price, setPrice] = useState("");
  const [selfService, setSelfService] = useState(true);
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [error, setError] = useState("");
  const [stationError, setStationError] = useState("");

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
          setAvailableStations(nextStations);
          setStationId(nextStations[0]?.id ?? 0);
          setStationSearch("");
        }
      } catch (loadError) {
        if (!abortController.signal.aborted) {
          setAvailableStations([]);
          setStationId(0);
          setStationError(loadError instanceof Error ? loadError.message : "Impossibile caricare i distributori per questa citta.");
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
  }, [cityId, fuelTypeCode]);

  function handleCitySelect(nextCityId: number) {
    const nextCity = cities.find((city) => city.id === nextCityId);
    if (!nextCity) {
      return;
    }

    setProvinceId(nextCity.provinceId);
    setCityId(nextCityId);
    setCitySearch(nextCity.name);
  }

  function handleProvinceSelect(nextProvinceId: number) {
    setProvinceId(nextProvinceId);
    const firstCity = cities.find((city) => city.provinceId === nextProvinceId);

    if (firstCity) {
      setCityId(firstCity.id);
      setCitySearch(firstCity.name);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStation) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await createPriceReport({
        stationId: selectedStation.id,
        stationName: selectedStation.name,
        brand: selectedStation.brand,
        cityName: selectedStation.cityName,
        fuelTypeCode,
        price: Number(price.replace(",", ".")),
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
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={17} aria-hidden="true" />
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
                <span className={`block text-xs font-bold ${city.id === cityId ? "text-white/76" : "text-ink/50"}`}>{city.provinceName}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-sm font-black text-ink">Carburante</span>
            <select
              className="h-12 rounded-md border border-ink/10 bg-white px-3"
              value={fuelTypeCode}
              onChange={(event) => {
                const nextFuelType = event.target.value as FuelTypeCode;
                setFuelTypeCode(nextFuelType);

                if (nextFuelType === "GPL") {
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
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-ink">Prezzo</span>
            <input
              className="h-12 rounded-md border border-ink/10 px-3"
              inputMode="decimal"
              placeholder="1,699"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </label>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-black text-ink">Modalita</legend>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={selfService}
                className={`h-12 rounded-md border font-black ${selfService ? "border-mint bg-mint text-white" : "border-ink/10 bg-white"}`}
                onClick={() => setSelfService(true)}
              >
                Self
              </button>
              <button
                type="button"
                aria-pressed={!selfService}
                className={`h-12 rounded-md border font-black ${!selfService ? "border-mint bg-mint text-white" : "border-ink/10 bg-white"}`}
                onClick={() => setSelfService(false)}
              >
                Servito
              </button>
            </div>
          </fieldset>
        </div>

        <div className="grid gap-3 rounded-md border border-ink/10 bg-paper p-3">
          <label className="grid gap-2">
            <span className="flex items-center justify-between gap-3 text-sm font-black text-ink">
              Benzinaio
              {isLoadingStations ? <span className="font-bold text-ink/50">Carico...</span> : <span className="font-bold text-ink/50">{availableStations.length} trovati</span>}
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

          <div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
            {isLoadingStations ? (
              Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-md bg-white/80" />
              ))
            ) : (
              filteredStations.map((station) => (
                <button
                  key={station.id}
                  type="button"
                  className={`rounded-md border bg-white p-3 text-left transition ${
                    station.id === stationId ? "border-petrol ring-2 ring-petrol/12" : "border-ink/10 hover:border-petrol/35"
                  }`}
                  onClick={() => setStationId(station.id)}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate font-black text-ink">{station.brand} - {station.name}</span>
                      <span className="mt-1 block text-sm text-ink/62">{station.address}</span>
                      <span className="mt-1 block text-xs font-bold text-petrol">{station.cityName}</span>
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
            <span className="text-sm font-bold text-ink/58">Nessun distributore trovato per questa citta e carburante.</span>
          ) : null}
          {!isLoadingStations && availableStations.length > 0 && filteredStations.length === 0 ? (
            <span className="text-sm font-bold text-ink/58">Nessun distributore corrisponde alla ricerca.</span>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-black text-ink">Nome opzionale</span>
            <input className="h-12 rounded-md border border-ink/10 px-3" value={reporterName} onChange={(event) => setReporterName(event.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black text-ink">Email opzionale</span>
            <input
              className="h-12 rounded-md border border-ink/10 px-3"
              type="email"
              value={reporterEmail}
              onChange={(event) => setReporterEmail(event.target.value)}
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-black text-ink">Nota opzionale</span>
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
