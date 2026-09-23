"use client";

import type { FuelTypeCode } from "@/types/fuel";
import { FUEL_TYPES } from "@/types/fuel";

interface FuelSelectorProps {
  value: FuelTypeCode;
  onChange: (value: FuelTypeCode) => void;
}

export function FuelSelector({ value, onChange }: FuelSelectorProps) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">Carburante</span>
      <select
        className="h-12 w-full rounded-md border border-ink/10 bg-white px-3 text-base font-bold text-ink shadow-sm"
        value={value}
        onChange={(event) => onChange(event.target.value as FuelTypeCode)}
      >
        {FUEL_TYPES.map((fuel) => (
          <option key={fuel.code} value={fuel.code}>
            {fuel.name}
          </option>
        ))}
      </select>
    </label>
  );
}
