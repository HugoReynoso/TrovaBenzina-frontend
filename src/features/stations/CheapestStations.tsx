"use client";

import { Navigation } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { intlLocale, type Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { formatEuro, getStationPrice } from "@/lib/price";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { Station } from "@/types/station";

interface CheapestStationsProps {
  stations: Station[];
  fuelType: FuelTypeCode;
  serviceMode: ServiceMode;
  cityName?: string;
  title?: string;
  /** Clic su un distributore: la pagina centra la mappa su di lui. */
  onSelectStation?: (station: Station) => void;
  /** false quando il titolo e' gia' mostrato altrove (es. box a scomparsa su mobile): evita titoli e id duplicati. */
  showHeader?: boolean;
  locale?: Locale;
}

export function CheapestStations({ stations, fuelType, serviceMode, cityName, title, onSelectStation, showHeader = true, locale = "it" }: CheapestStationsProps) {
  const t = getMessages(locale);
  const intl = intlLocale(locale);
  if (stations.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink/20 bg-white p-5 text-sm text-ink/70">
        {t.cheapest.empty}
      </div>
    );
  }

  return (
    <section
      aria-labelledby={showHeader ? "piu-economici" : undefined}
      className={showHeader ? "rounded-md border border-ink/10 bg-white p-3 shadow-sm md:p-4" : undefined}
    >
      {showHeader ? (
        <div className="flex items-center justify-between gap-3">
          <h2 id="piu-economici" className="text-lg font-black leading-tight text-ink md:text-xl">
            {title ?? t.cheapest.fallbackTitle(cityName)}
          </h2>
          <span className="shrink-0 whitespace-nowrap rounded-md bg-mint/12 px-2 py-1 text-xs font-black text-mint">{t.cheapest.top(stations.length)}</span>
        </div>
      ) : null}
      <ol className={showHeader ? "mt-3 grid gap-2 md:mt-4 md:gap-3" : "grid gap-2"}>
        {stations.map((station, index) => {
          const price = getStationPrice(station, fuelType, serviceMode);
          return (
            <li
              key={station.id}
              className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md bg-ink/[0.035] p-2.5 md:grid-cols-[auto_auto_1fr_auto] md:gap-3 md:p-3 ${
                onSelectStation ? "cursor-pointer transition hover:bg-petrol/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-petrol" : ""
              }`}
              onClick={onSelectStation ? () => onSelectStation(station) : undefined}
              onKeyDown={
                onSelectStation
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectStation(station);
                      }
                    }
                  : undefined
              }
              tabIndex={onSelectStation ? 0 : undefined}
              title={onSelectStation ? t.cheapest.showOnMap : undefined}
            >
              <span className="grid size-7 place-items-center rounded-md bg-white text-xs font-black text-ink shadow-sm md:size-8 md:text-sm">
                {index + 1}
              </span>
              <span className="hidden md:inline-flex">
                <BrandLogo brand={station.brand} compact />
              </span>
              <div className="min-w-0">
                {/* Due righe al massimo invece di troncare: nome e indirizzo restano leggibili anche nella colonna laterale. */}
                <p className="line-clamp-2 break-words text-sm font-black leading-tight text-ink md:text-base">{station.name}</p>
                <p className="mt-0.5 line-clamp-2 break-words text-xs leading-snug text-ink/62 md:text-sm">
                  {station.brand} · {station.distanceKm ? `${station.distanceKm.toFixed(1)} km` : station.address}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-black text-mint md:text-base">{price ? formatEuro(price.price, intl) : "-"}</p>
                <a
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-bold text-petrol hover:bg-petrol/8 md:px-2"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Navigation size={13} aria-hidden="true" />
                  {t.cheapest.directions}
                </a>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
