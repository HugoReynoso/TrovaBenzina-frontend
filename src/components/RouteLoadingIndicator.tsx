"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteLoadingIndicator() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    let timeout: number | undefined;

    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest("a[href]");

      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      const nextUrl = new URL(link.href);
      const currentUrl = new URL(window.location.href);
      const opensElsewhere = link.target && link.target !== "_self";
      const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

      if (
        opensElsewhere ||
        isModifiedClick ||
        nextUrl.origin !== currentUrl.origin ||
        `${nextUrl.pathname}${nextUrl.search}` === `${currentUrl.pathname}${currentUrl.search}`
      ) {
        return;
      }

      setIsNavigating(true);
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setIsNavigating(false), 2500);
    }

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.clearTimeout(timeout);
    };
  }, []);

  if (!isNavigating) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[9999] h-1 bg-petrol/15" role="status" aria-label="Caricamento pagina">
      <div className="route-loading-bar h-full w-1/2 bg-petrol" />
    </div>
  );
}
