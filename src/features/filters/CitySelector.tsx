"use client";

import { useEffect, useMemo, useState } from "react";
import type { City } from "@/types/location";

interface CitySelectorProps {
  cities: City[];
  value: string;
  onChange: (slug: string) => void;
}

const POPULAR_CITY_SLUGS = ["milano", "roma", "torino", "napoli", "bologna", "firenze", "genova", "palermo", "venezia", "verona", "bari", "catania"];

export function CitySelector({ cities, value, onChange }: CitySelectorProps) {
  const sortedCities = useMemo(() => [...cities].sort((left, right) => left.name.localeCompare(right.name, "it")), [cities]);
  const selectedCity = sortedCities.find((city) => city.slug === value) ?? sortedCities[0];
  const [provinceId, setProvinceId] = useState(selectedCity?.provinceId ?? 0);
  const provinces = useMemo(() => {
    const byId = new Map<number, string>();
    sortedCities.forEach((city) => byId.set(city.provinceId, city.provinceName));
    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((left, right) => left.name.localeCompare(right.name, "it"));
  }, [sortedCities]);
  const provinceCities = useMemo(() => sortedCities.filter((city) => city.provinceId === provinceId), [provinceId, sortedCities]);
  const popularCities = useMemo(
    () => POPULAR_CITY_SLUGS.map((slug) => sortedCities.find((city) => city.slug === slug)).filter((city): city is City => Boolean(city)),
    [sortedCities]
  );

  useEffect(() => {
    if (selectedCity) {
      setProvinceId(selectedCity.provinceId);
    }
  }, [selectedCity]);

  function handleProvinceChange(nextProvinceId: number) {
    setProvinceId(nextProvinceId);
    const firstCity = sortedCities.find((city) => city.provinceId === nextProvinceId);

    if (firstCity) {
      onChange(firstCity.slug);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
        <label className="grid gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">Provincia</span>
          <select
            className="h-12 w-full rounded-md border border-ink/10 bg-white px-3 text-base font-bold text-ink shadow-sm"
            value={provinceId}
            onChange={(event) => handleProvinceChange(Number(event.target.value))}
          >
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">Comune</span>
          <select
            className="h-12 w-full rounded-md border border-ink/10 bg-white px-3 text-base font-bold text-ink shadow-sm"
            value={selectedCity?.slug ?? ""}
            onChange={(event) => onChange(event.target.value)}
          >
            {provinceCities.map((city) => (
              <option key={city.id} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {popularCities.length > 0 ? (
        <div className="grid gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink/52">Citta principali</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {popularCities.slice(0, 6).map((city) => (
              <button
                key={city.id}
                className={`h-10 rounded-md border px-2 text-sm font-black transition ${
                  city.slug === value ? "border-petrol bg-petrol text-white" : "border-ink/10 bg-white text-ink hover:border-petrol/35"
                }`}
                type="button"
                onClick={() => onChange(city.slug)}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
