"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { LocateFixed } from "lucide-react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { formatEuro, getPriceTone, getStationPrice } from "@/lib/price";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { City } from "@/types/location";
import type { Station } from "@/types/station";

interface StationMapProps {
  city: City;
  stations: Station[];
  fuelType: FuelTypeCode;
  serviceMode: ServiceMode;
  averagePrice: number;
}

function markerIcon(brand: string, price: number, averagePrice: number) {
  const tone = getPriceTone(price, averagePrice);
  return L.divIcon({
    className: "price-marker",
    html: `<div class="price-marker__card marker-${tone}"><span class="price-marker__brand">${brand}</span><span class="price-marker__price">${price.toFixed(3)} EUR</span></div>`,
    iconSize: [82, 48],
    iconAnchor: [41, 48],
    popupAnchor: [0, -44]
  });
}

function LocationControl() {
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
    requestPosition(true);
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

export function StationMap({ city, stations, fuelType, serviceMode, averagePrice }: StationMapProps) {
  return (
    <div className="h-[58vh] min-h-[390px] overflow-hidden rounded-md border border-ink/10 shadow-soft sm:h-[62vh] md:h-[680px]">
      <MapContainer center={[city.latitude, city.longitude]} zoom={12} scrollWheelZoom className="z-0 h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationControl />
        {stations.map((station) => {
          const price = getStationPrice(station, fuelType, serviceMode);
          if (!price) {
            return null;
          }

          return (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={markerIcon(station.brand, price.price, averagePrice)}
            >
              <Popup>
                <article className="min-w-56">
                  <p className="text-sm font-black text-ink">{station.brand}</p>
                  <h3 className="mt-1 text-base font-black text-ink">{station.name}</h3>
                  <p className="mt-1 text-sm text-ink/70">{station.address}</p>
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
                    className="mt-3 inline-flex rounded-md bg-petrol px-3 py-2 text-sm font-black text-white"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Naviga
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
