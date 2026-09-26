"use client";

import { MapPin } from "lucide-react";
import type { Province } from "@/types/location";

interface ProvinceSelectorProps {
  provinces: Province[];
  value: number;
  onChange: (provinceId: number) => void;
}

const priorityProvinceCodes = ["MI", "RM", "NA", "TO", "BO", "FI", "GE", "PA", "VE", "VR", "BA", "CT"];

export function ProvinceSelector({ provinces, value, onChange }: ProvinceSelectorProps) {
  const sortedProvinces = [...provinces].sort((left, right) => {
    const leftPriority = priorityProvinceCodes.indexOf(left.code);
    const rightPriority = priorityProvinceCodes.indexOf(right.code);

    if (leftPriority !== -1 || rightPriority !== -1) {
      return (leftPriority === -1 ? 999 : leftPriority) - (rightPriority === -1 ? 999 : rightPriority);
    }

    return left.name.localeCompare(right.name, "it");
  });

  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">Provincia</span>
      <span className="relative block">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-petrol" size={18} aria-hidden="true" />
        <select
          className="h-11 w-full appearance-none rounded-md border border-ink/10 bg-white px-10 text-base font-black text-ink shadow-sm transition hover:border-petrol/35 md:h-12"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        >
          {sortedProvinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-ink/44">▼</span>
      </span>
    </label>
  );
}
