"use client";

import { useMemo } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import type { Province } from "@/types/location";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

interface ProvinceSelectorProps {
  provinces: Province[];
  value: number;
  onChange: (provinceId: number) => void;
  locale?: Locale;
  /** compact: senza etichetta visibile, per i filtri sopra la mappa. */
  variant?: "default" | "compact";
}

export function ProvinceSelector({ provinces, value, onChange, locale = "it", variant = "default" }: ProvinceSelectorProps) {
  const t = getMessages(locale);
  const compact = variant === "compact";
  const sortedProvinces = useMemo(() => [...provinces].sort((left, right) => left.name.localeCompare(right.name, "it")), [provinces]);

  return (
    <label className="grid min-w-0 gap-1.5">
      <span className={compact ? "sr-only" : "text-xs font-bold uppercase tracking-[0.08em] text-ink/60"}>{t.filters.province}</span>
      <span className="relative block">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-petrol" size={18} aria-hidden="true" />
        <select
          className={`w-full appearance-none truncate rounded-md border border-ink/10 px-10 font-black text-ink shadow-sm transition hover:border-petrol/35 ${
            compact ? "h-11 bg-white/95 text-sm" : "h-11 bg-white text-base md:h-12"
          }`}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        >
          {sortedProvinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/60" size={18} aria-hidden="true" />
      </span>
    </label>
  );
}
