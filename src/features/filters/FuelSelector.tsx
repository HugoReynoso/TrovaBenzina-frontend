"use client";

import { ChevronDown, Fuel } from "lucide-react";
import type { FuelTypeCode } from "@/types/fuel";
import { FUEL_TYPES } from "@/types/fuel";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

interface FuelSelectorProps {
  value: FuelTypeCode;
  onChange: (value: FuelTypeCode) => void;
  locale?: Locale;
  /** compact: senza etichetta visibile, per i filtri sopra la mappa. */
  variant?: "default" | "compact";
}

export function FuelSelector({ value, onChange, locale = "it", variant = "default" }: FuelSelectorProps) {
  const t = getMessages(locale);
  const compact = variant === "compact";
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className={compact ? "sr-only" : "text-xs font-bold uppercase tracking-[0.08em] text-ink/60"}>{t.filters.fuel}</span>
      <span className="relative block">
        <Fuel className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-petrol" size={18} aria-hidden="true" />
        <select
          className={`w-full appearance-none rounded-md border border-ink/10 px-10 font-black text-ink shadow-sm transition hover:border-petrol/35 ${
            compact ? "h-11 bg-white/95 text-sm" : "h-11 bg-white text-base md:h-12"
          }`}
          value={value}
          onChange={(event) => onChange(event.target.value as FuelTypeCode)}
        >
          {FUEL_TYPES.map((fuel) => (
            <option key={fuel.code} value={fuel.code}>
              {t.fuelName[fuel.code]}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/60" size={18} aria-hidden="true" />
      </span>
    </label>
  );
}
