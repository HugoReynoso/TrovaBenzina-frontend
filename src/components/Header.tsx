"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { withBasePath } from "@/lib/site";
import { LanguageSelector } from "./LanguageSelector";

const navItems = [
  { href: "/prezzo-benzina/milano", label: "Prezzi" },
  { href: "/storico-prezzo-benzina/milano", label: "Storico" },
  { href: "/accise-benzina", label: "Accise" },
  { href: "/notizie", label: "Notizie" },
  { href: "/segnala-prezzo", label: "Segnala" }
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/92 backdrop-blur" suppressHydrationWarning>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6" suppressHydrationWarning>
        <Link href="/" className="flex items-center gap-2 tracking-normal text-ink" aria-label="TrovaBenzina home" onClick={() => setMenuOpen(false)}>
          <Image src={withBasePath("/brand/trovabenzina-mark.svg")} alt="" width={40} height={40} priority />
          <span className="grid leading-none">
            <span className="text-base font-black md:text-lg">
              <span>Trova</span>
              <span className="text-[#d49318]">Benzina</span>
            </span>
            <span className="mt-0.5 text-[10px] font-bold leading-tight text-petrol md:text-xs">Trova il pieno che fa meno male.</span>
          </span>
        </Link>
        <nav aria-label="Navigazione principale" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-ink/76 transition hover:bg-ink/5 hover:text-ink"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2" suppressHydrationWarning>
          <LanguageSelector />
          <button
            className="grid size-10 place-items-center rounded-md border border-ink/10 bg-white md:hidden"
            aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
            aria-expanded={menuOpen}
            type="button"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <nav className="border-t border-ink/10 bg-white px-4 py-3 shadow-sm md:hidden" aria-label="Navigazione mobile">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="rounded-md px-3 py-3 text-base font-black text-ink transition hover:bg-ink/5"
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
