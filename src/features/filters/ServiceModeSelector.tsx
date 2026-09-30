"use client";

import type { ServiceMode } from "@/types/fuel";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

const options: ServiceMode[] = ["self", "served", "all"];

interface ServiceModeSelectorProps {
  value: ServiceMode;
  onChange: (value: ServiceMode) => void;
  locale?: Locale;
  /** compact: senza etichetta visibile, per i filtri sopra la mappa. */
  variant?: "default" | "compact";
}

export function ServiceModeSelector({ value, onChange, locale = "it", variant = "default" }: ServiceModeSelectorProps) {
  const t = getMessages(locale);
  const compact = variant === "compact";
  return (
    <div className="grid min-w-0 gap-1.5" role="group" aria-label={t.filters.mode}>
      {compact ? null : <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink/60" aria-hidden="true">{t.filters.mode}</span>}
      <div className={`grid grid-cols-3 rounded-md border border-ink/10 p-1 shadow-sm ${compact ? "bg-white/95" : "bg-white"}`}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={option === value}
            className={`h-9 whitespace-nowrap rounded-[6px] px-2 text-xs font-black transition sm:text-sm ${compact ? "" : "md:h-10"} ${
              option === value ? "bg-petrol text-white shadow-sm" : "text-ink/68 hover:bg-petrol/8 hover:text-petrol"
            }`}
            onClick={() => onChange(option)}
          >
            {t.serviceMode[option]}
          </button>
        ))}
      </div>
    </div>
  );
}
