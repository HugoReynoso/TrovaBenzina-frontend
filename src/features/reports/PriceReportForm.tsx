"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search, Send } from "lucide-react";
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
  const [cityId, setCityId] = useState(initialCity?.id ?? cities[0]?.id ?? 0);
  const [citySearch, setCitySearch] = useState(initialCity?.name ?? cities[0]?.name ?? "");
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
  const filteredCities = useMemo(() => {
    const query = citySearch.trim().toLowerCase();
    const matches = query.length < 2 ? cities.slice(0, 40) : cities.filter((city) => city.name.toLowerCase().includes(query));
    const selectedCity = cities.find((city) => city.id === cityId);
    const visibleCities = selectedCity && !matches.some((city) => city.id === selectedCity.id) ? [selectedCity, ...matches] : matches;

    return visibleCities.slice(0, 80);
  }, [cities, cityId, citySearch]);

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
    setCityId(nextCityId);
    setCitySearch(nextCity?.name ?? "");
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
          <label className="grid gap-2">
            <span className="text-sm font-black text-ink">Citta</span>
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
          <select
            className="h-12 rounded-md border border-ink/10 bg-white px-3 text-base"
            value={cityId}
            onChange={(event) => handleCitySelect(Number(event.target.value))}
            required
          >
            {filteredCities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name} - {city.provinceName}
              </option>
            ))}
          </select>
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

        <label className="grid gap-2">
          <span className="flex items-center justify-between gap-3 text-sm font-black text-ink">
            Distributore
            {isLoadingStations ? <span className="font-bold text-ink/50">Carico...</span> : null}
          </span>
          <select
            className="h-12 rounded-md border border-ink/10 bg-white px-3 text-base disabled:bg-ink/[0.04]"
            value={stationId}
            onChange={(event) => setStationId(Number(event.target.value))}
            disabled={isLoadingStations || availableStations.length === 0}
            required
          >
            {availableStations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.brand} - {station.name}, {station.address}
              </option>
            ))}
          </select>
          {stationError ? <span className="text-sm font-bold text-tomato">{stationError}</span> : null}
          {!isLoadingStations && availableStations.length === 0 && !stationError ? (
            <span className="text-sm font-bold text-ink/58">Nessun distributore trovato per questa citta e carburante.</span>
          ) : null}
        </label>

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
