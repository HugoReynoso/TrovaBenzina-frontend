"use client";

import dynamic from "next/dynamic";

export const DynamicStationMap = dynamic(() => import("./StationMap").then((module) => module.StationMap), {
  ssr: false,
  loading: () => (
    <div className="grid h-[58vh] min-h-[390px] place-items-center rounded-md border border-ink/10 bg-white shadow-soft sm:h-[62vh] md:h-[680px]">
      <div className="grid gap-3 text-center">
        <div className="mx-auto h-3 w-44 rounded-full bg-ink/10" />
        <div className="mx-auto h-3 w-32 rounded-full bg-ink/10" />
        <p className="text-sm font-bold text-ink/60">Carico la mappa...</p>
      </div>
    </div>
  )
});
