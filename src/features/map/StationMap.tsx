"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, LocateFixed, Navigation, PencilLine } from "lucide-react";
import Link from "next/link";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { BrandLogo } from "@/components/BrandLogo";
import { escapeHtml, getFuelBrand } from "@/lib/brand";
import { locateUser } from "@/lib/geolocation";
import { intlLocale, type Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { formatEuro, getPriceTone, getStationPrice } from "@/lib/price";
import { withBasePath } from "@/lib/site";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { City } from "@/types/location";
import type { Station } from "@/types/station";

export type LocationStatus = "idle" | "loading" | "ready" | "unavailable" | "denied";

/** Richiesta di centrare la mappa su un distributore (requestId cambia ad ogni clic). */
export interface StationFocusRequest {
  stationId: number;
  latitude: number;
  longitude: number;
  requestId: number;
}

interface StationMapProps {
  city: City;
  stations: Station[];
  fuelType: FuelTypeCode;
  serviceMode: ServiceMode;
  averagePrice: number;
  userPosition?: { latitude: number; longitude: number } | null;
  locationLoading?: boolean;
  onUserPositionChange?: (position: { latitude: number; longitude: number }) => void;
  locateRequestId?: number;
  onLocationStatusChange?: (status: LocationStatus) => void;
  className?: string;
  showLocationControl?: boolean;
  /** Posizione verticale del bottone "Posizionami" (classi Tailwind top-*). */
  locationControlClassName?: string;
  /** Quando cambia, la mappa vola sul distributore e ne apre la scheda. */
  focusRequest?: StationFocusRequest | null;
  locale?: Locale;
}

function markerIcon(brand: string, price: number, averagePrice: number) {
  const tone = getPriceTone(price, averagePrice);
  const fuelBrand = getFuelBrand(brand);
  const brandContent = fuelBrand.image
    ? `<img class="brand-logo__image" src="${withBasePath(fuelBrand.image)}" alt="" aria-hidden="true" />`
    : escapeHtml(fuelBrand.initials);

  return L.divIcon({
    className: "price-marker",
    html: `<div class="price-marker__card marker-${tone}"><span class="brand-logo brand-logo--${fuelBrand.key} brand-logo--marker">${brandContent}</span><span class="price-marker__price">${price.toFixed(3)}</span></div>`,
    iconSize: [58, 42],
    iconAnchor: [29, 42],
    popupAnchor: [0, -38]
  });
}

function clusterIcon(count: number) {
  return L.divIcon({
    className: "station-cluster",
    html: `<div class="station-cluster__bubble">${count}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
}

function clusterPrecision(zoom: number): number | null {
  if (zoom >= 14) {
    return null;
  }

  if (zoom >= 12) {
    return 2;
  }

  if (zoom >= 9) {
    return 1;
  }

  return 0;
}

interface StationCluster {
  id: string;
  latitude: number;
  longitude: number;
  stations: Station[];
}

function buildClusters(stations: Station[], precision: number | null): StationCluster[] {
  if (precision === null) {
    return stations.map((station) => ({
      id: `station-${station.id}`,
      latitude: station.latitude,
      longitude: station.longitude,
      stations: [station]
    }));
  }

  const buckets = new Map<string, Station[]>();
  stations.forEach((station) => {
    const key = `${station.latitude.toFixed(precision)}:${station.longitude.toFixed(precision)}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(station);
    buckets.set(key, bucket);
  });

  return [...buckets.entries()].map(([id, bucket]) => ({
    id,
    latitude: bucket.reduce((total, station) => total + station.latitude, 0) / bucket.length,
    longitude: bucket.reduce((total, station) => total + station.longitude, 0) / bucket.length,
    stations: bucket
  }));
}

function LocationControl({
  locateRequestId = 0,
  onLocationStatusChange,
  onUserPositionChange,
  userPosition,
  locationLoading = false,
  positionClassName = "top-[108px] sm:top-3",
  locale = "it"
}: {
  positionClassName?: string;
  locale?: Locale;
  locateRequestId?: number;
  onLocationStatusChange?: (status: LocationStatus) => void;
  onUserPositionChange?: (position: { latitude: number; longitude: number }) => void;
  userPosition?: { latitude: number; longitude: number } | null;
  locationLoading?: boolean;
}) {
  const map = useMap();
  const t = getMessages(locale);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");

  function updateStatus(nextStatus: LocationStatus) {
    setStatus(nextStatus);
    onLocationStatusChange?.(nextStatus);
  }

  const cancelLocateRef = useRef<(() => void) | null>(null);

  function requestPosition(focusMap = true) {
    cancelLocateRef.current?.();
    updateStatus("loading");

    cancelLocateRef.current = locateUser({
      onSuccess: ({ latitude, longitude }) => {
        cancelLocateRef.current = null;
        setPosition({ lat: latitude, lng: longitude });
        updateStatus("ready");

        if (focusMap) {
          onUserPositionChange?.({ latitude, longitude });
          map.setView([latitude, longitude], Math.max(map.getZoom(), 14), { animate: true });
        }
      },
      onFailure: (reason) => {
        // Non azzeriamo cancelLocateRef: il GPS resta in ascolto e una posizione tardiva
        // chiamera' comunque onSuccess (che toglie l'errore e sposta la mappa).
        updateStatus(reason);
      }
    });
  }

  useEffect(() => {
    if (locateRequestId > 0) {
      requestPosition(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locateRequestId]);

  useEffect(() => () => cancelLocateRef.current?.(), []);

  const isBusy = status === "loading" || locationLoading;
  const label = isBusy ? t.location.locating : status === "ready" ? t.location.located : t.location.locateMe;
  const displayedPosition = userPosition ? { lat: userPosition.latitude, lng: userPosition.longitude } : position;

  return (
    <>
      <button
        type="button"
        className={`absolute right-3 ${positionClassName} z-[500] inline-flex h-10 items-center gap-1.5 rounded-md border border-ink/10 bg-white/95 px-2.5 text-[11px] font-black text-ink shadow-soft backdrop-blur transition hover:bg-white sm:gap-2 sm:px-3 sm:text-xs`}
        aria-label={t.location.locateAria}
        title={t.location.locateTitle}
        aria-busy={isBusy}
        disabled={isBusy}
        onClick={() => requestPosition(true)}
      >
        {isBusy ? <LoaderCircle className="animate-spin" size={16} aria-hidden="true" /> : <LocateFixed size={16} aria-hidden="true" />}
        <span>{label}</span>
      </button>
      {displayedPosition ? (
        <CircleMarker
          center={[displayedPosition.lat, displayedPosition.lng]}
          pathOptions={{ color: "#991B1B", fillColor: "#EF4444", fillOpacity: 0.62, weight: 4 }}
          radius={16}
        >
          <Popup>{t.location.youAreHere}</Popup>
        </CircleMarker>
      ) : null}
    </>
  );
}

function CityMapController({ city, userPosition }: { city: City; userPosition?: { latitude: number; longitude: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (userPosition) {
      map.setView([userPosition.latitude, userPosition.longitude], Math.max(map.getZoom(), 14), { animate: true });
      return;
    }

    map.setView([city.latitude, city.longitude], 12, { animate: true });
  }, [city.id, city.latitude, city.longitude, map, userPosition]);

  return null;
}

function MapSizeObserver() {
  const map = useMap();

  useEffect(() => {
    let frame = 0;
    const invalidateSize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    };
    const container = map.getContainer();
    const observer = new ResizeObserver(invalidateSize);

    observer.observe(container);
    window.addEventListener("resize", invalidateSize);
    window.addEventListener("orientationchange", invalidateSize);
    invalidateSize();
    const settleTimer = window.setTimeout(invalidateSize, 250);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      observer.disconnect();
      window.removeEventListener("resize", invalidateSize);
      window.removeEventListener("orientationchange", invalidateSize);
    };
  }, [map]);

  return null;
}

export function StationMap({
  city,
  stations,
  fuelType,
  serviceMode,
  averagePrice,
  userPosition,
  locationLoading = false,
  onUserPositionChange,
  locateRequestId,
  onLocationStatusChange,
  className,
  showLocationControl = true,
  locationControlClassName,
  focusRequest,
  locale = "it"
}: StationMapProps) {
  const t = getMessages(locale);
  const intl = intlLocale(locale);
  const [zoom, setZoom] = useState(12);
  const markerRefs = useRef(new Map<number, L.Marker>());
  const precision = clusterPrecision(zoom);
  const clusters = useMemo(() => buildClusters(stations, precision), [precision, stations]);

  return (
    <div className={className ?? "h-[54vh] min-h-[360px] overflow-hidden rounded-md border border-ink/10 shadow-soft sm:h-[62vh] md:h-[680px]"}>
      <MapContainer center={[city.latitude, city.longitude]} zoom={12} scrollWheelZoom className="z-0 h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomTracker onZoomChange={setZoom} />
        <MapSizeObserver />
        <CityMapController city={city} userPosition={userPosition} />
        <StationFocusController focusRequest={focusRequest} markerRefs={markerRefs} />
        {showLocationControl ? (
          <LocationControl
            locateRequestId={locateRequestId}
            onLocationStatusChange={onLocationStatusChange}
            onUserPositionChange={onUserPositionChange}
            userPosition={userPosition}
            locationLoading={locationLoading}
            positionClassName={locationControlClassName}
            locale={locale}
          />
        ) : null}
        {clusters.map((cluster) => {
          if (cluster.stations.length > 1) {
            return (
              <ClusterMarker
                key={cluster.id}
                cluster={cluster}
              />
            );
          }

          const station = cluster.stations[0];
          const price = getStationPrice(station, fuelType, serviceMode);
          if (!price) {
            return null;
          }

          const reportHref = `/segnala-prezzo?stationId=${station.id}&cityId=${station.cityId}&fuelType=${fuelType}&selfService=${price.selfService}&price=${price.price.toFixed(3)}`;

          return (
            <Marker
              key={cluster.id}
              ref={(marker) => {
                if (marker) {
                  markerRefs.current.set(station.id, marker);
                } else {
                  markerRefs.current.delete(station.id);
                }
              }}
              position={[station.latitude, station.longitude]}
              icon={markerIcon(station.brand, price.price, averagePrice)}
            >
              <Popup>
                <article className="min-w-56">
                  <div className="flex items-center gap-2">
                    <BrandLogo brand={station.brand} compact />
                    <p className="text-sm font-black text-ink">{station.brand}</p>
                  </div>
                  <h3 className="mt-1 text-base font-black text-ink">{station.name}</h3>
                  <p className="mt-1 text-sm text-ink/70">{station.address}</p>
                  {station.distanceKm ? <p className="mt-1 text-xs font-black text-petrol">{t.location.kmFromYou(station.distanceKm.toFixed(1))}</p> : null}
                  <dl className="mt-3 grid gap-2 text-sm">
                    {station.prices.map((stationPrice) => (
                      <div key={`${stationPrice.fuelTypeCode}-${stationPrice.selfService}`} className="flex justify-between gap-3">
                        <dt>
                          {t.fuelName[stationPrice.fuelTypeCode] ?? stationPrice.fuelTypeName}{" "}
                          {stationPrice.selfService ? t.priceMode.self : t.priceMode.served}
                        </dt>
                        <dd className="font-black">{formatEuro(stationPrice.price, intl)}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-2 text-xs text-ink/58">
                    {t.map.updatedOn(new Intl.DateTimeFormat(intl).format(new Date(price.communicatedAt)))}
                  </p>
                  <div className="mt-3 grid grid-cols-[0.9fr_1.1fr] gap-2">
                    <Link
                      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-petrol/20 bg-petrol/8 px-2 py-2 text-xs font-black text-petrol transition hover:border-petrol/45 hover:bg-petrol/12"
                      href={reportHref}
                    >
                      <PencilLine size={14} aria-hidden="true" />
                      {t.map.updatePrice}
                    </Link>
                    <a
                      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-amber px-2 py-2 text-xs font-black text-ink shadow-sm transition hover:bg-[#e0a42f]"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Navigation size={14} aria-hidden="true" />
                      {t.map.route}
                    </a>
                  </div>
                </article>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

const FOCUS_ZOOM = 16;

function StationFocusController({
  focusRequest,
  markerRefs
}: {
  focusRequest?: StationFocusRequest | null;
  markerRefs: { current: Map<number, L.Marker> };
}) {
  const map = useMap();

  useEffect(() => {
    if (!focusRequest) {
      return;
    }

    let cancelled = false;
    let retryTimer = 0;

    // Dopo lo zoom i cluster si separano e il marker del distributore viene creato:
    // riproviamo per qualche istante finche' non esiste, poi apriamo la sua scheda.
    const openPopup = (attempt = 0) => {
      if (cancelled) {
        return;
      }
      const marker = markerRefs.current.get(focusRequest.stationId);
      if (marker) {
        marker.openPopup();
        return;
      }
      if (attempt < 20) {
        retryTimer = window.setTimeout(() => openPopup(attempt + 1), 100);
      }
    };

    let opened = false;
    const handleMoveEnd = () => {
      if (!opened) {
        opened = true;
        openPopup();
      }
    };
    map.once("moveend", handleMoveEnd);
    // Sicurezza: se la mappa era gia' li' e "moveend" non arriva, apriamo comunque la scheda.
    const fallbackTimer = window.setTimeout(handleMoveEnd, 1500);
    map.flyTo([focusRequest.latitude, focusRequest.longitude], Math.max(map.getZoom(), FOCUS_ZOOM), { duration: 0.8 });

    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
      window.clearTimeout(fallbackTimer);
      map.off("moveend", handleMoveEnd);
    };
    // Reagiamo solo a una nuova richiesta (requestId), non ad ogni render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequest?.requestId, map]);

  return null;
}

function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom())
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

function ClusterMarker({ cluster }: { cluster: StationCluster }) {
  const map = useMap();

  return (
    <Marker
      position={[cluster.latitude, cluster.longitude]}
      icon={clusterIcon(cluster.stations.length)}
      eventHandlers={{
        click: () => {
          map.setView([cluster.latitude, cluster.longitude], Math.min(map.getZoom() + 2, 16), { animate: true });
        }
      }}
    />
  );
}
