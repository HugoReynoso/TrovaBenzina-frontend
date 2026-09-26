"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { LocateFixed, Navigation } from "lucide-react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { BrandLogo } from "@/components/BrandLogo";
import { escapeHtml, getFuelBrand } from "@/lib/brand";
import { formatEuro, getPriceTone, getStationPrice } from "@/lib/price";
import { withBasePath } from "@/lib/site";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { City } from "@/types/location";
import type { Station } from "@/types/station";

interface StationMapProps {
  city: City;
  stations: Station[];
  fuelType: FuelTypeCode;
  serviceMode: ServiceMode;
  averagePrice: number;
  userPosition?: { latitude: number; longitude: number } | null;
  onUserPositionChange?: (position: { latitude: number; longitude: number }) => void;
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

function LocationControl({ onUserPositionChange }: { onUserPositionChange?: (position: { latitude: number; longitude: number }) => void }) {
  const map = useMap();
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");

  function requestPosition(focusMap = true) {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (location) => {
        const nextPosition = {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        };
        setPosition(nextPosition);
        setStatus("ready");

        if (focusMap) {
          onUserPositionChange?.({ latitude: nextPosition.lat, longitude: nextPosition.lng });
          map.setView([nextPosition.lat, nextPosition.lng], Math.max(map.getZoom(), 14), { animate: true });
        }
      },
      () => {
        setStatus("unavailable");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 9000
      }
    );
  }

  useEffect(() => {
    requestPosition(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = status === "loading" ? "Cerco..." : status === "ready" ? "Posizione" : "Posizionami";

  return (
    <>
      <button
        type="button"
        className="absolute right-3 top-3 z-[500] inline-flex h-10 items-center gap-2 rounded-md border border-ink/10 bg-white/95 px-3 text-xs font-black text-ink shadow-soft backdrop-blur transition hover:bg-white"
        aria-label="Trova la mia posizione sulla mappa"
        title="Trova la mia posizione"
        onClick={() => requestPosition(true)}
      >
        <LocateFixed size={16} aria-hidden="true" />
        <span className="hidden sm:inline">{label}</span>
      </button>
      {position ? (
        <CircleMarker
          center={[position.lat, position.lng]}
          pathOptions={{ color: "#165A67", fillColor: "#1F9D68", fillOpacity: 0.28, weight: 3 }}
          radius={12}
        >
          <Popup>Sei qui</Popup>
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

export function StationMap({ city, stations, fuelType, serviceMode, averagePrice, userPosition, onUserPositionChange }: StationMapProps) {
  const [zoom, setZoom] = useState(12);
  const precision = clusterPrecision(zoom);
  const clusters = useMemo(() => buildClusters(stations, precision), [precision, stations]);

  return (
    <div className="h-[54vh] min-h-[360px] overflow-hidden rounded-md border border-ink/10 shadow-soft sm:h-[62vh] md:h-[680px]">
      <MapContainer center={[city.latitude, city.longitude]} zoom={12} scrollWheelZoom className="z-0 h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomTracker onZoomChange={setZoom} />
        <CityMapController city={city} userPosition={userPosition} />
        <LocationControl onUserPositionChange={onUserPositionChange} />
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

          return (
            <Marker
              key={cluster.id}
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
                  {station.distanceKm ? <p className="mt-1 text-xs font-black text-petrol">{station.distanceKm.toFixed(1)} km da te</p> : null}
                  <dl className="mt-3 grid gap-2 text-sm">
                    {station.prices.map((stationPrice) => (
                      <div key={`${stationPrice.fuelTypeCode}-${stationPrice.selfService}`} className="flex justify-between gap-3">
                        <dt>
                          {stationPrice.fuelTypeName} {stationPrice.selfService ? "self" : "servito"}
                        </dt>
                        <dd className="font-black">{formatEuro(stationPrice.price)}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-2 text-xs text-ink/58">
                    Aggiornato: {new Intl.DateTimeFormat("it-IT").format(new Date(price.communicatedAt))}
                  </p>
                  <a
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber px-3 py-2.5 text-sm font-black text-ink shadow-sm transition hover:bg-[#e0a42f]"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Navigation size={16} aria-hidden="true" />
                    Apri percorso
                  </a>
                </article>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
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
