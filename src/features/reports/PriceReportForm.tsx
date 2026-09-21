"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { createPriceReport } from "@/lib/api/reports";
import type { FuelTypeCode } from "@/types/fuel";
import { FUEL_TYPES } from "@/types/fuel";
import type { Station } from "@/types/station";

interface PriceReportFormProps {
  stations: Station[];
}

export function PriceReportForm({ stations }: PriceReportFormProps) {
  const [stationId, setStationId] = useState(stations[0]?.id ?? 0);
  const [fuelTypeCode, setFuelTypeCode] = useState<FuelTypeCode>("BENZINA");
  const [price, setPrice] = useState("");
  const [selfService, setSelfService] = useState(true);
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedStation = useMemo(
    () => stations.find((station) => station.id === stationId) ?? stations[0],
    [stationId, stations]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStation) {
      return;
    }

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

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-black text-ink">Distributore</span>
          <select
            className="h-12 rounded-md border border-ink/10 bg-white px-3 text-base"
            value={stationId}
            onChange={(event) => setStationId(Number(event.target.value))}
            required
          >
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.brand} - {station.name}, {station.cityName}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-sm font-black text-ink">Carburante</span>
            <select
              className="h-12 rounded-md border border-ink/10 bg-white px-3"
              value={fuelTypeCode}
              onChange={(event) => setFuelTypeCode(event.target.value as FuelTypeCode)}
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

        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-petrol px-5 font-black text-white md:w-fit" type="submit">
          <Send size={18} aria-hidden="true" />
          Invia per approvazione
        </button>
      </form>
    </section>
  );
}
