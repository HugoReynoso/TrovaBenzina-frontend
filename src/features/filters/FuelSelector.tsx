"use client";

import { Fuel } from "lucide-react";
import type { FuelTypeCode } from "@/types/fuel";
import { FUEL_TYPES } from "@/types/fuel";

interface FuelSelectorProps {
  value: FuelTypeCode;
  onChange: (value: FuelTypeCode) => void;
}

export function FuelSelector({ value, onChange }: FuelSelectorProps) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">Carburante</span>
      <span className="relative block">
        <Fuel className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-petrol" size={18} aria-hidden="true" />
        <select
          className="h-11 w-full appearance-none rounded-md border border-ink/10 bg-white px-10 text-base font-black text-ink shadow-sm transition hover:border-petrol/35 md:h-12"
          value={value}
          onChange={(event) => onChange(event.target.value as FuelTypeCode)}
        >
          {FUEL_TYPES.map((fuel) => (
            <option key={fuel.code} value={fuel.code}>
              {fuel.name}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-ink/44">▼</span>
      </span>
    </label>
  );
}
