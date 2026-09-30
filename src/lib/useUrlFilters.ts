"use client";

import { useEffect, useRef } from "react";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { Province } from "@/types/location";

/**
 * Filtri nell'indirizzo della pagina (es. /mappa/?provincia=roma&carburante=diesel&modalita=servito):
 * una ricerca si puo' condividere, salvare nei preferiti e sopravvive al ricaricamento.
 * Il sito e' statico, quindi i parametri si leggono nel browser dopo il caricamento.
 */
const FUEL_PARAMS: Record<FuelTypeCode, string> = { BENZINA: "benzina", DIESEL: "diesel", GPL: "gpl", METANO: "metano" };
const MODE_PARAMS: Record<ServiceMode, string> = { self: "self", served: "servito", all: "tutti" };

export function provinceParam(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function findKey<T extends string>(map: Record<T, string>, value: string | null): T | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.toLowerCase();
  return (Object.keys(map) as T[]).find((key) => map[key] === normalized);
}

interface UrlFiltersOptions {
  provinces: Province[];
  initialProvinceId: number;
  provinceId: number;
  fuelType: FuelTypeCode;
  serviceMode: ServiceMode;
  /** false quando si usa la posizione dell'utente: la provincia non va nell'indirizzo. */
  includeProvince: boolean;
  onRead: (filters: { provinceId?: number; fuelType?: FuelTypeCode; serviceMode?: ServiceMode }) => void;
}

export function useUrlFilters({ provinces, initialProvinceId, provinceId, fuelType, serviceMode, includeProvince, onRead }: UrlFiltersOptions) {
  const readRef = useRef(false);

  // Una sola volta all'avvio: applica i filtri presenti nell'indirizzo.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const provinceValue = params.get("provincia");
    const province = provinceValue ? provinces.find((item) => provinceParam(item.name) === provinceValue.toLowerCase()) : undefined;
    onRead({
      provinceId: province?.id,
      fuelType: findKey(FUEL_PARAMS, params.get("carburante")),
      serviceMode: findKey(MODE_PARAMS, params.get("modalita"))
    });
    readRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ad ogni cambio aggiorna l'indirizzo senza creare voci nella cronologia.
  // Con i filtri predefiniti l'indirizzo resta pulito (nessun parametro).
  useEffect(() => {
    if (!readRef.current) {
      return;
    }
    const url = new URL(window.location.href);
    const province = provinces.find((item) => item.id === provinceId);
    const setOrDelete = (key: string, value: string | null) => (value ? url.searchParams.set(key, value) : url.searchParams.delete(key));

    setOrDelete("provincia", includeProvince && province && provinceId !== initialProvinceId ? provinceParam(province.name) : null);
    setOrDelete("carburante", fuelType !== "BENZINA" ? FUEL_PARAMS[fuelType] : null);
    setOrDelete("modalita", serviceMode !== "self" ? MODE_PARAMS[serviceMode] : null);

    if (url.href !== window.location.href) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [fuelType, includeProvince, initialProvinceId, provinceId, provinces, serviceMode]);
}
