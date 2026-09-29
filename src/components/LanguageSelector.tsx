"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { equivalentPath, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

interface LanguageSelectorProps {
  locale: Locale;
  pathname: string;
}

export function LanguageSelector({ locale, pathname }: LanguageSelectorProps) {
  const router = useRouter();
  const t = getMessages(locale);

  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-white px-2 py-2 text-sm font-bold text-ink shadow-sm">
      <Languages size={16} aria-hidden="true" />
      <span className="sr-only">{t.chooseLanguage}</span>
      <select
        className="bg-transparent text-sm font-bold outline-none"
        value={locale}
        aria-label={t.chooseLanguage}
        onChange={(event) => {
          const target = event.target.value as Locale;
          if (target !== locale) {
            // Porta alla stessa pagina nella lingua scelta (o alla home di quella lingua se non esiste).
            router.push(equivalentPath(pathname, target));
          }
        }}
      >
        {SUPPORTED_LOCALES.map((item) => (
          <option key={item.code} value={item.code} lang={item.code}>
            {item.shortLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
