"use client";

import { Navigation } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { formatEuro, getStationPrice } from "@/lib/price";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { Station } from "@/types/station";

interface CheapestStationsProps {
  stations: Station[];
  fuelType: FuelTypeCode;
  serviceMode: ServiceMode;
  cityName?: string;
  title?: string;
}

export function CheapestStations({ stations, fuelType, serviceMode, cityName, title }: CheapestStationsProps) {
  if (stations.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink/20 bg-white p-5 text-sm text-ink/70">
        Nessun distributore trovato con questi filtri.
      </div>
    );
  }

  return (
    <section aria-labelledby="piu-economici" className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 id="piu-economici" className="text-xl font-black text-ink">
          {title ?? `Piu economici${cityName ? ` (${cityName})` : ""}`}
        </h2>
        <span className="rounded-md bg-mint/12 px-2 py-1 text-xs font-black text-mint">Top {stations.length}</span>
      </div>
      <ol className="mt-4 grid gap-3">
        {stations.map((station, index) => {
          const price = getStationPrice(station, fuelType, serviceMode);
          return (
            <li key={station.id} className="grid grid-cols-[auto_auto_1fr_auto] gap-3 rounded-md bg-ink/[0.035] p-3">
              <span className="grid size-8 place-items-center rounded-md bg-white text-sm font-black text-ink shadow-sm">
                {index + 1}
              </span>
              <BrandLogo brand={station.brand} compact />
              <div>
                <p className="font-black text-ink">{station.name}</p>
                <p className="text-sm text-ink/62">
                  {station.brand} · {station.distanceKm ? `${station.distanceKm.toFixed(1)} km` : station.address}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-mint">{price ? formatEuro(price.price) : "-"}</p>
                <a
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-petrol hover:bg-petrol/8"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Navigation size={13} aria-hidden="true" />
                  Naviga
                </a>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
