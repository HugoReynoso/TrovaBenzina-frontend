"use client";

import { useEffect, useState } from "react";

/**
 * true se la media query e' soddisfatta. Vale false durante il rendering statico e l'idratazione,
 * cosi' server e client producono lo stesso HTML; si aggiorna subito dopo il montaggio.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [query]);

  return matches;
}
