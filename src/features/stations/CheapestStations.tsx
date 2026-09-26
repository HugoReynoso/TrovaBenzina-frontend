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
    <section aria-labelledby="piu-economici" className="rounded-md border border-ink/10 bg-white p-3 shadow-sm md:p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="piu-economici" className="text-lg font-black leading-tight text-ink md:text-xl">
          {title ?? `Piu economici${cityName ? ` (${cityName})` : ""}`}
        </h2>
        <span className="rounded-md bg-mint/12 px-2 py-1 text-xs font-black text-mint">Top {stations.length}</span>
      </div>
      <ol className="mt-3 grid gap-2 md:mt-4 md:gap-3">
        {stations.map((station, index) => {
          const price = getStationPrice(station, fuelType, serviceMode);
          return (
            <li key={station.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md bg-ink/[0.035] p-2.5 md:grid-cols-[auto_auto_1fr_auto] md:gap-3 md:p-3">
              <span className="grid size-7 place-items-center rounded-md bg-white text-xs font-black text-ink shadow-sm md:size-8 md:text-sm">
                {index + 1}
              </span>
              <span className="hidden md:inline-flex">
                <BrandLogo brand={station.brand} compact />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-ink md:text-base">{station.name}</p>
                <p className="truncate text-xs text-ink/62 md:text-sm">
                  {station.brand} · {station.distanceKm ? `${station.distanceKm.toFixed(1)} km` : station.address}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-black text-mint md:text-base">{price ? formatEuro(price.price) : "-"}</p>
                <a
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-bold text-petrol hover:bg-petrol/8 md:px-2 md:text-xs"
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
