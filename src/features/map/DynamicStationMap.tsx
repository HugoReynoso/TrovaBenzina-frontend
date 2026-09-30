"use client";

import dynamic from "next/dynamic";

const loadStationMap = () => import("./StationMap");

// Scarica il codice della mappa (Leaflet) subito, in parallelo al resto della pagina, invece di
// aspettare che la pagina sia interattiva: su mobile la mappa compare prima.
if (typeof window !== "undefined") {
  void loadStationMap();
}

export const DynamicStationMap = dynamic(() => loadStationMap().then((module) => module.StationMap), {
  ssr: false,
  loading: () => (
    // Riempie il contenitore della mappa, che ne decide l'altezza: niente salti quando la mappa e' pronta.
    <div className="grid h-full min-h-[360px] place-items-center rounded-md border border-ink/10 bg-white shadow-soft">
      <div className="grid gap-3 text-center" aria-hidden="true">
        <div className="mx-auto h-3 w-44 rounded-full bg-ink/10" />
        <div className="mx-auto h-3 w-32 rounded-full bg-ink/10" />
        <div className="mx-auto h-3 w-20 animate-pulse rounded-full bg-petrol/20" />
      </div>
    </div>
  )
});
