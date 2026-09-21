"use client";

import type { FuelTypeCode } from "@/types/fuel";
import { FUEL_TYPES } from "@/types/fuel";

interface FuelSelectorProps {
  value: FuelTypeCode;
  onChange: (value: FuelTypeCode) => void;
}

export function FuelSelector({ value, onChange }: FuelSelectorProps) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">Carburante</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FUEL_TYPES.map((fuel) => (
          <button
            key={fuel.code}
            type="button"
            aria-pressed={value === fuel.code}
            className={`rounded-md border px-3 py-2 text-sm font-bold transition ${
              value === fuel.code
                ? "border-petrol bg-petrol text-white"
                : "border-ink/10 bg-white text-ink hover:border-petrol/40"
            }`}
            onClick={() => onChange(fuel.code)}
          >
            {fuel.name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
