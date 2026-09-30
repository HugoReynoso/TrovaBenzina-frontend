"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { Hand, LoaderCircle, LocateFixed, MousePointerClick, Navigation, PencilLine } from "lucide-react";
import Link from "next/link";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents, ZoomControl } from "react-leaflet";
import { BrandLogo } from "@/components/BrandLogo";
import { escapeHtml, getFuelBrand } from "@/lib/brand";
import { locateUser } from "@/lib/geolocation";
import { intlLocale, type Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { formatEuro, formatPrice, getPriceTone, getStationPrice } from "@/lib/price";
import { withBasePath } from "@/lib/site";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { City } from "@/types/location";
import type { Station, StationPrice } from "@/types/station";

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
  /** Prezzo tipico della zona: colora i marker (verde sotto, rosso sopra). */
  referencePrice: number;
  /** Distributori piu' economici: sempre visibili (mai raggruppati) e numerati sulla mappa. */
  highlightStationIds?: number[];
  /** Distributore evidenziato dalla lista (es. scheda visibile nel carosello su mobile). */
  activeStationId?: number | null;
  userPosition?: { latitude: number; longitude: number } | null;
  locationLoading?: boolean;
  onUserPositionChange?: (position: { latitude: number; longitude: number }) => void;
  locateRequestId?: number;
  onLocationStatusChange?: (status: LocationStatus) => void;
  className?: string;
  showLocationControl?: boolean;
  /**
   * true quando la pagina scorre sotto la mappa: la rotella zooma solo dopo un clic sulla mappa,
   * cosi' chi scorre la pagina non resta "incastrato" nella mappa.
   */
  guardWheel?: boolean;
  /** Quando cambia, la mappa vola sul distributore e ne apre la scheda. */
  focusRequest?: StationFocusRequest | null;
  locale?: Locale;
}

/** Distanza minima (in pixel) tra due marker prima di raggrupparli. */
const CLUSTER_RADIUS_PX = 84;
/** Da questo zoom in su ogni distributore ha il suo marker. */
const NO_CLUSTER_ZOOM = 16;
const FOCUS_ZOOM = 16;

interface PricedStation {
  station: Station;
  price: StationPrice;
}

interface StationCluster {
  id: string;
  /** Il distributore piu' economico del gruppo: posizione e prezzo "da ..." del gruppo. */
  lead: PricedStation;
  members: PricedStation[];
  point: L.Point;
  pinned: boolean;
}

/**
 * Raggruppa i distributori vicini sullo schermo. Si parte dai piu' economici, cosi' il prezzo
 * migliore di ogni zona resta sempre visibile (come marker o come "da ..." del gruppo).
 * Considera solo i distributori nell'area visibile: con centinaia di punti la mappa resta fluida.
 */
function buildClusters(entries: PricedStation[], zoom: number, bounds: L.LatLngBounds, pinnedIds: Set<number>): StationCluster[] {
  const clusters: StationCluster[] = [];
  const grid = new Map<string, StationCluster[]>();
  const clusterAll = zoom < NO_CLUSTER_ZOOM;

  for (const entry of entries) {
    const { latitude, longitude } = entry.station;
    if (!bounds.contains([latitude, longitude])) {
      continue;
    }

    const point = L.CRS.EPSG3857.latLngToPoint(L.latLng(latitude, longitude), zoom);
    const cellX = Math.floor(point.x / CLUSTER_RADIUS_PX);
    const cellY = Math.floor(point.y / CLUSTER_RADIUS_PX);
    const pinned = pinnedIds.has(entry.station.id);

    if (clusterAll && !pinned) {
      let target: StationCluster | undefined;
      for (let dx = -1; dx <= 1 && !target; dx += 1) {
        for (let dy = -1; dy <= 1 && !target; dy += 1) {
          target = grid
            .get(`${cellX + dx}:${cellY + dy}`)
            ?.find((cluster) => !cluster.pinned && cluster.point.distanceTo(point) < CLUSTER_RADIUS_PX);
        }
      }
      if (target) {
        target.members.push(entry);
        continue;
      }
    }

    const cluster: StationCluster = { id: `${entry.station.id}`, lead: entry, members: [entry], point, pinned };
    clusters.push(cluster);
    const key = `${cellX}:${cellY}`;
    grid.set(key, [...(grid.get(key) ?? []), cluster]);
  }

  return clusters;
}

function markerHtml(brand: string, priceLabel: string, tone: string, rank: number | null, active: boolean) {
  const fuelBrand = getFuelBrand(brand);
  const brandContent = fuelBrand.image
    ? `<img class="brand-logo__image" src="${withBasePath(fuelBrand.image)}" alt="" aria-hidden="true" />`
    : escapeHtml(fuelBrand.initials);
  const classes = ["price-marker__card", `marker-${tone}`, rank ? "price-marker__card--best" : "", active ? "price-marker__card--active" : ""]
    .filter(Boolean)
    .join(" ");
  const rankBadge = rank ? `<span class="price-marker__rank">${rank}</span>` : "";

  return `<div class="${classes}">${rankBadge}<span class="brand-logo brand-logo--${fuelBrand.key} brand-logo--marker">${brandContent}</span><span class="price-marker__price">${escapeHtml(priceLabel)}</span></div>`;
}

function LocationControl({
  locateRequestId = 0,
  onLocationStatusChange,
  onUserPositionChange,
  userPosition,
  locationLoading = false,
  locale = "it"
}: {
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
      {/* In basso a destra, come i controlli delle app di mappe: non si sovrappone ai filtri in alto. */}
      <button
        type="button"
        className="absolute bottom-7 right-3 z-[500] inline-flex h-11 items-center gap-2 rounded-md border border-ink/10 bg-white/95 px-3 text-xs font-black text-ink shadow-soft backdrop-blur transition hover:bg-white"
        aria-label={t.location.locateAria}
        title={t.location.locateTitle}
        aria-busy={isBusy}
        disabled={isBusy}
        onClick={(event) => {
          event.stopPropagation();
          requestPosition(true);
        }}
      >
        {isBusy ? <LoaderCircle className="animate-spin" size={16} aria-hidden="true" /> : <LocateFixed size={16} aria-hidden="true" />}
        {/* Sul telefono solo l'icona: lascia spazio all'avviso "Tocca la mappa" in basso a sinistra. */}
        <span className="hidden sm:inline">{label}</span>
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

/**
 * Inquadra la zona scelta. Senza posizione dell'utente mostra la citta' e, se ci sono,
 * i distributori piu' economici: cosi' il prezzo migliore e' visibile appena si apre la mappa.
 */
function ViewController({
  city,
  userPosition,
  highlights
}: {
  city: City;
  userPosition?: { latitude: number; longitude: number } | null;
  highlights: Station[];
}) {
  const map = useMap();
  const highlightKey = highlights.map((station) => station.id).join(",");

  useEffect(() => {
    if (userPosition) {
      map.setView([userPosition.latitude, userPosition.longitude], Math.max(map.getZoom(), 14), { animate: true });
      return;
    }

    if (highlights.length === 0) {
      map.setView([city.latitude, city.longitude], 12, { animate: true });
      return;
    }

    const bounds = L.latLngBounds([[city.latitude, city.longitude]]);
    highlights.forEach((station) => bounds.extend([station.latitude, station.longitude]));
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 13, animate: true });
    // Reagiamo solo al cambio di zona o dei distributori piu' economici, non ad ogni render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city.id, city.latitude, city.longitude, highlightKey, map, userPosition]);

  return null;
}

/** Porta in vista il distributore attivo (senza cambiare lo zoom) se e' fuori dall'area visibile. */
function ActiveStationController({ station }: { station?: Station }) {
  const map = useMap();

  useEffect(() => {
    if (!station) {
      return;
    }
    const position = L.latLng(station.latitude, station.longitude);
    if (!map.getBounds().pad(-0.1).contains(position)) {
      map.panTo(position, { animate: true });
    }
  }, [map, station]);

  return null;
}

/**
 * Evita che la mappa "catturi" lo scroll della pagina:
 * - touch: un dito scorre la pagina, due dita zoomano; un tocco sulla mappa la attiva per spostarla.
 * - mouse (se guardWheel): la rotella zooma solo dopo un clic sulla mappa.
 */
function InteractionGuard({ guardWheel, locale }: { guardWheel: boolean; locale: Locale }) {
  const map = useMap();
  const t = getMessages(locale);
  const [touchLocked, setTouchLocked] = useState(false);
  const [showWheelHint, setShowWheelHint] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const container = map.getContainer();
    let hintTimer = 0;

    if (isTouch) {
      map.dragging.disable();
      setTouchLocked(true);
    }
    if (guardWheel) {
      map.scrollWheelZoom.disable();
    }

    const activate = () => {
      if (isTouch && !map.dragging.enabled()) {
        map.dragging.enable();
        setTouchLocked(false);
      }
      if (guardWheel && !isTouch) {
        map.scrollWheelZoom.enable();
        setShowWheelHint(false);
      }
    };
    const handleMouseLeave = () => {
      if (guardWheel) {
        map.scrollWheelZoom.disable();
      }
    };
    const handleWheel = () => {
      if (guardWheel && !isTouch && !map.scrollWheelZoom.enabled()) {
        setShowWheelHint(true);
        window.clearTimeout(hintTimer);
        hintTimer = window.setTimeout(() => setShowWheelHint(false), 1600);
      }
    };
    // Quando la mappa esce dallo schermo torna "bloccata", cosi' lo scroll della pagina riprende normale.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (isTouch && entry.intersectionRatio < 0.35 && map.dragging.enabled()) {
          map.dragging.disable();
          setTouchLocked(true);
        }
      },
      { threshold: [0, 0.35] }
    );

    container.addEventListener("click", activate);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("wheel", handleWheel, { passive: true });
    observer.observe(container);

    return () => {
      window.clearTimeout(hintTimer);
      container.removeEventListener("click", activate);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("wheel", handleWheel);
      observer.disconnect();
    };
  }, [guardWheel, map]);

  if (touchLocked) {
    return (
      <p className="pointer-events-none absolute bottom-7 left-3 z-[500] inline-flex h-11 items-center gap-2 rounded-md bg-ink/80 px-3 text-xs font-black text-white shadow-soft">
        <Hand size={16} aria-hidden="true" />
        {t.map.touchHint}
      </p>
    );
  }

  if (showWheelHint) {
    return (
      <div className="pointer-events-none absolute inset-0 z-[600] grid place-items-center bg-ink/25">
        <p className="inline-flex items-center gap-2 rounded-md bg-ink/85 px-4 py-3 text-sm font-black text-white shadow-soft">
          <MousePointerClick size={18} aria-hidden="true" />
          {t.map.wheelHint}
        </p>
      </div>
    );
  }

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
  referencePrice,
  highlightStationIds = [],
  activeStationId = null,
  userPosition,
  locationLoading = false,
  onUserPositionChange,
  locateRequestId,
  onLocationStatusChange,
  className,
  showLocationControl = true,
  guardWheel = true,
  focusRequest,
  locale = "it"
}: StationMapProps) {
  const t = getMessages(locale);
  const intl = intlLocale(locale);
  const [viewport, setViewport] = useState<{ zoom: number; bounds: L.LatLngBounds } | null>(null);
  const markerRefs = useRef(new Map<number, L.Marker>());
  const iconCacheRef = useRef(new Map<string, L.DivIcon>());

  // Dal piu' economico al piu' caro: il raggruppamento parte dai prezzi migliori.
  const pricedStations = useMemo(
    () =>
      stations
        .map((station) => ({ station, price: getStationPrice(station, fuelType, serviceMode) }))
        .filter((entry): entry is PricedStation => Boolean(entry.price))
        .sort((left, right) => left.price.price - right.price.price),
    [fuelType, serviceMode, stations]
  );
  const highlightKey = highlightStationIds.join(",");
  const highlights = useMemo(
    () => highlightStationIds.map((id) => stations.find((station) => station.id === id)).filter((station): station is Station => Boolean(station)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [highlightKey, stations]
  );
  const focusedStationId = focusRequest?.stationId;
  const clusters = useMemo(() => {
    if (!viewport) {
      return [];
    }
    const pinned = new Set(highlightStationIds);
    if (activeStationId) {
      pinned.add(activeStationId);
    }
    if (focusedStationId) {
      pinned.add(focusedStationId);
    }
    return buildClusters(pricedStations, viewport.zoom, viewport.bounds.pad(0.25), pinned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStationId, focusedStationId, highlightKey, pricedStations, viewport]);
  const activeStation = useMemo(
    () => (activeStationId ? stations.find((station) => station.id === activeStationId) : undefined),
    [activeStationId, stations]
  );

  function cachedIcon(key: string, create: () => L.DivIcon): L.DivIcon {
    const cache = iconCacheRef.current;
    let icon = cache.get(key);
    if (!icon) {
      icon = create();
      cache.set(key, icon);
    }
    return icon;
  }

  function stationIcon(entry: PricedStation, rank: number | null, active: boolean) {
    const tone = getPriceTone(entry.price.price, referencePrice);
    const priceLabel = formatPrice(entry.price.price, intl);
    return cachedIcon(`s|${entry.station.brand}|${priceLabel}|${tone}|${rank ?? ""}|${active ? 1 : 0}`, () =>
      L.divIcon({
        className: "price-marker",
        html: markerHtml(entry.station.brand, priceLabel, tone, rank, active),
        iconSize: [62, 44],
        iconAnchor: [31, 44],
        popupAnchor: [0, -40]
      })
    );
  }

  function clusterIcon(cluster: StationCluster) {
    const tone = getPriceTone(cluster.lead.price.price, referencePrice);
    const fromLabel = t.map.clusterFrom(formatPrice(cluster.lead.price.price, intl));
    const count = cluster.members.length;
    return cachedIcon(`c|${count}|${fromLabel}|${tone}`, () =>
      L.divIcon({
        className: "station-cluster",
        html: `<div class="station-cluster__bubble station-cluster--${tone}"><span class="station-cluster__count">${count}</span><span class="station-cluster__price">${escapeHtml(fromLabel)}</span></div>`,
        iconSize: [72, 48],
        iconAnchor: [36, 24]
      })
    );
  }

  return (
    <div className={className ?? "h-full min-h-[360px] overflow-hidden rounded-md border border-ink/10 shadow-soft"}>
      <MapContainer center={[city.latitude, city.longitude]} zoom={12} scrollWheelZoom zoomControl={false} className="z-0 h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* In basso a destra, sopra "Posizionami": in alto a sinistra finiva sotto i filtri della pagina Mappa. */}
        <ZoomControl position="bottomright" />
        <ViewportTracker onChange={setViewport} />
        <MapSizeObserver />
        <InteractionGuard guardWheel={guardWheel} locale={locale} />
        <ViewController city={city} userPosition={userPosition} highlights={highlights} />
        <ActiveStationController station={activeStation} />
        <StationFocusController focusRequest={focusRequest} markerRefs={markerRefs} />
        {showLocationControl ? (
          <LocationControl
            locateRequestId={locateRequestId}
            onLocationStatusChange={onLocationStatusChange}
            onUserPositionChange={onUserPositionChange}
            userPosition={userPosition}
            locationLoading={locationLoading}
            locale={locale}
          />
        ) : null}
        {clusters.map((cluster) => {
          if (cluster.members.length > 1) {
            return <ClusterMarker key={`c-${cluster.id}`} cluster={cluster} icon={clusterIcon(cluster)} />;
          }

          const { station, price } = cluster.lead;
          const rankIndex = highlightStationIds.indexOf(station.id);
          const rank = rankIndex >= 0 ? rankIndex + 1 : null;
          const isActive = station.id === activeStationId;
          const reportHref = `/segnala-prezzo?stationId=${station.id}&cityId=${station.cityId}&fuelType=${fuelType}&selfService=${price.selfService}&price=${price.price.toFixed(3)}`;

          return (
            <Marker
              key={`s-${station.id}`}
              ref={(marker) => {
                if (marker) {
                  markerRefs.current.set(station.id, marker);
                } else {
                  markerRefs.current.delete(station.id);
                }
              }}
              position={[station.latitude, station.longitude]}
              icon={stationIcon(cluster.lead, rank, isActive)}
              zIndexOffset={isActive ? 2000 : rank ? 1000 - rank : 0}
            >
              <Popup>
                <article className="min-w-56">
                  <div className="flex items-center gap-2">
                    <BrandLogo brand={station.brand} compact />
                    <p className="text-sm font-black text-ink">{station.brand}</p>
                    {rank === 1 ? <span className="ml-auto rounded-md bg-mint px-2 py-0.5 text-xs font-black text-white">{t.map.bestBadge}</span> : null}
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

    // Dopo lo zoom i gruppi si separano e il marker del distributore viene creato:
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

/** Riporta zoom e area visibile: servono per raggruppare e disegnare solo i marker in vista. */
function ViewportTracker({ onChange }: { onChange: (viewport: { zoom: number; bounds: L.LatLngBounds }) => void }) {
  const map = useMapEvents({
    moveend: () => onChange({ zoom: map.getZoom(), bounds: map.getBounds() }),
    resize: () => onChange({ zoom: map.getZoom(), bounds: map.getBounds() })
  });

  useEffect(() => {
    onChange({ zoom: map.getZoom(), bounds: map.getBounds() });
  }, [map, onChange]);

  return null;
}

function ClusterMarker({ cluster, icon }: { cluster: StationCluster; icon: L.DivIcon }) {
  const map = useMap();

  return (
    <Marker
      position={[cluster.lead.station.latitude, cluster.lead.station.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => {
          const bounds = L.latLngBounds(cluster.members.map((member) => [member.station.latitude, member.station.longitude]));
          map.fitBounds(bounds, { padding: [64, 64], maxZoom: NO_CLUSTER_ZOOM, animate: true });
        }
      }}
    />
  );
}
