"use client";

import { useEffect, useState } from "react";

/**
 * Ora corrente, ma solo dopo il montaggio nel browser (null durante il rendering statico
 * e l'idratazione, cosi' server e client producono lo stesso HTML).
 */
export function useNow(refreshMs = 60 * 60 * 1000): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), refreshMs);
    return () => window.clearInterval(timer);
  }, [refreshMs]);

  return now;
}
