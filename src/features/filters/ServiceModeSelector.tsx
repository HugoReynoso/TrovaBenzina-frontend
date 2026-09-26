"use client";

import type { ServiceMode } from "@/types/fuel";

const options: { value: ServiceMode; label: string }[] = [
  { value: "self", label: "Self service" },
  { value: "served", label: "Servito" },
  { value: "all", label: "Miglior prezzo" }
];

interface ServiceModeSelectorProps {
  value: ServiceMode;
  onChange: (value: ServiceMode) => void;
}

export function ServiceModeSelector({ value, onChange }: ServiceModeSelectorProps) {
  return (
    <fieldset className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">Modalita</span>
      <div className="grid grid-cols-3 rounded-md border border-ink/10 bg-white p-1 shadow-sm">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`h-10 rounded-[6px] px-2 text-xs font-black transition sm:text-sm ${
              option.value === value ? "bg-petrol text-white shadow-sm" : "text-ink/68 hover:bg-petrol/8 hover:text-petrol"
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
