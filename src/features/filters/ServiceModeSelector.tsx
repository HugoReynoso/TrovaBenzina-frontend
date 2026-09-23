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
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">Modalita</span>
      <select
        className="h-12 w-full rounded-md border border-ink/10 bg-white px-3 text-base font-bold text-ink shadow-sm"
        value={value}
        onChange={(event) => onChange(event.target.value as ServiceMode)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
