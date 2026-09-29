"use client";

import type { ServiceMode } from "@/types/fuel";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

const options: ServiceMode[] = ["self", "served", "all"];

interface ServiceModeSelectorProps {
  value: ServiceMode;
  onChange: (value: ServiceMode) => void;
  locale?: Locale;
}

export function ServiceModeSelector({ value, onChange, locale = "it" }: ServiceModeSelectorProps) {
  const t = getMessages(locale);
  return (
    <fieldset className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60">{t.filters.mode}</span>
      <div className="grid grid-cols-3 rounded-md border border-ink/10 bg-white p-1 shadow-sm">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`h-9 rounded-[6px] px-1 text-[11px] font-black transition sm:text-sm md:h-10 md:px-2 ${
              option === value ? "bg-petrol text-white shadow-sm" : "text-ink/68 hover:bg-petrol/8 hover:text-petrol"
            }`}
            onClick={() => onChange(option)}
          >
            {t.serviceMode[option]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
