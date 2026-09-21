"use client";

import type { City } from "@/types/location";

interface CitySelectorProps {
  cities: City[];
  value: string;
  onChange: (slug: string) => void;
}

export function CitySelector({ cities, value, onChange }: CitySelectorProps) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">Citta</span>
      <select
        className="h-11 rounded-md border border-ink/10 bg-white px-3 font-bold text-ink shadow-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {cities.map((city) => (
          <option key={city.id} value={city.slug}>
            {city.name}
          </option>
        ))}
      </select>
    </label>
  );
}
