"use client";

import Image from "next/image";
import { useState } from "react";
import { Maximize2, X } from "lucide-react";
import { withBasePath } from "@/lib/site";

interface FuelCompositionProps {
  detailed?: boolean;
}

export function FuelComposition(_props: FuelCompositionProps = {}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <section className="overflow-hidden rounded-md border border-ink/10 bg-white shadow-sm" aria-label="Composizione del prezzo">
      <button
        type="button"
        className="group relative block w-full bg-paper text-left"
        aria-label="Apri infografica composizione prezzo in grande"
        onClick={() => setExpanded(true)}
      >
        <Image
          src={withBasePath("/brand/tax-infographic.png")}
          alt="Infografica satirica sulla composizione del prezzo benzina e sulle accise"
          width={1680}
          height={945}
          className="h-auto w-full"
          sizes="(min-width: 1024px) 760px, 100vw"
        />
        <span className="absolute bottom-3 right-3 hidden items-center gap-2 rounded-md bg-ink/88 px-3 py-2 text-xs font-black text-white shadow-soft transition group-hover:bg-ink md:inline-flex">
          <Maximize2 size={15} aria-hidden="true" />
          Ingrandisci
        </span>
      </button>
      </section>

      {expanded ? (
        <div className="fixed inset-0 z-[1000] hidden bg-ink/86 p-6 backdrop-blur-sm md:grid" role="dialog" aria-modal="true" aria-label="Infografica composizione prezzo">
          <button
            type="button"
            className="absolute right-5 top-5 z-10 grid size-11 place-items-center rounded-md bg-white text-ink shadow-soft"
            aria-label="Chiudi infografica"
            onClick={() => setExpanded(false)}
          >
            <X size={22} aria-hidden="true" />
          </button>
          <button type="button" className="absolute inset-0 cursor-default" aria-label="Chiudi infografica" onClick={() => setExpanded(false)} />
          <div className="relative m-auto w-full max-w-7xl overflow-hidden rounded-md bg-white shadow-soft">
            <Image
              src={withBasePath("/brand/tax-infographic.png")}
              alt="Infografica satirica sulla composizione del prezzo benzina e sulle accise"
              width={1680}
              height={945}
              className="h-auto max-h-[88vh] w-full object-contain"
              sizes="90vw"
              priority
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
