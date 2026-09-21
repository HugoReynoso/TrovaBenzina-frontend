"use client";

import { Languages } from "lucide-react";
import { SUPPORTED_LOCALES } from "@/lib/i18n";

export function LanguageSelector() {
  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-2 py-2 text-sm font-bold text-ink shadow-sm">
      <Languages size={16} aria-hidden="true" />
      <span className="sr-only">Scegli lingua</span>
      <select
        className="bg-transparent text-sm font-bold outline-none"
        defaultValue="it"
        aria-label="Scegli lingua"
        onChange={(event) => {
          const lang = event.target.value;
          const url = new URL(window.location.href);
          if (lang === "it") {
            url.searchParams.delete("lang");
          } else {
            url.searchParams.set("lang", lang);
          }
          window.history.replaceState(null, "", url.toString());
        }}
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <option key={locale.code} value={locale.code}>
            {locale.shortLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
