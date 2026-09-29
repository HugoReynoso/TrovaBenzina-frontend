"use client";

import { useEffect } from "react";

/** Imposta la lingua del documento (<html lang>) nelle sezioni /en e /es. */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = previous || "it";
    };
  }, [lang]);

  return null;
}
