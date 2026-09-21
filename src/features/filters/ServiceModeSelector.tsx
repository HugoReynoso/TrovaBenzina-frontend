"use client";

import type { ServiceMode } from "@/types/fuel";

const options: { value: ServiceMode; label: string }[] = [
  { value: "self", label: "Self" },
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
      <legend className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">Modalita</legend>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            className={`rounded-md border px-2 py-2 text-sm font-bold transition ${
              value === option.value
                ? "border-mint bg-mint text-white"
                : "border-ink/10 bg-white text-ink hover:border-mint/50"
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
