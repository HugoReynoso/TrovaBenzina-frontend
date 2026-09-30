"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { withBasePath } from "@/lib/site";
import { LOCALE_ROUTES, localeFromPathname, type Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";
import { LanguageSelector } from "./LanguageSelector";

function navItemsFor(locale: Locale): Array<{ href: string; label: string; exact?: boolean }> {
  const t = getMessages(locale);
  const routes = LOCALE_ROUTES[locale];
  if (locale === "it") {
    return [
      { href: "/", label: t.nav.home, exact: true },
      { href: "/mappa", label: t.nav.map },
      { href: "/accise-benzina", label: t.nav.excise },
      { href: "/notizie", label: t.nav.news },
      { href: "/segnala-prezzo", label: t.nav.report }
    ];
  }
  // Le pagine Accise, Notizie e Segnala esistono solo in italiano.
  return [
    { href: routes.home, label: t.nav.home, exact: true },
    { href: routes.map, label: t.nav.map },
    { href: routes.fuelIndex, label: t.nav.pricesByCity }
  ];
}

function normalizePath(path: string): string {
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

function isActivePath(pathname: string, href: string, exact = false): boolean {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  return exact ? current === target : current === target || current.startsWith(`${target}/`);
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const locale = localeFromPathname(pathname);
  const t = getMessages(locale);
  const navItems = navItemsFor(locale);

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/92 backdrop-blur" suppressHydrationWarning>
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 md:px-6" suppressHydrationWarning>
        <Link href={LOCALE_ROUTES[locale].home} className="flex items-center gap-2 tracking-normal text-ink" aria-label="TrovaBenzina home" onClick={() => setMenuOpen(false)}>
          <Image src={withBasePath("/brand/trovabenzina-mark.svg")} alt="" width={40} height={40} priority />
          <span className="grid leading-none">
            <span className="text-base font-black md:text-lg">
              <span>Trova</span>
              <span className="text-[#d49318]">Benzina</span>
            </span>
            <span className="mt-0.5 text-xs font-bold leading-tight text-petrol max-[389px]:hidden">{t.tagline}</span>
          </span>
        </Link>
        <nav aria-label={t.mainNavigation} className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                className={`rounded-md px-3 py-2 text-sm transition hover:bg-ink/5 hover:text-ink ${
                  isActive
                    ? "font-black text-petrol underline decoration-[#d49318] decoration-[3px] underline-offset-[10px]"
                    : "font-semibold text-ink/76"
                }`}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2" suppressHydrationWarning>
          <LanguageSelector locale={locale} pathname={pathname} />
          <button
            className="grid size-10 place-items-center rounded-md border border-ink/10 bg-white md:hidden"
            aria-label={menuOpen ? t.closeMenu : t.openMenu}
            aria-expanded={menuOpen}
            type="button"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <nav className="border-t border-ink/10 bg-white px-4 py-3 shadow-sm md:hidden" aria-label={t.mobileNavigation}>
          <div className="mx-auto grid max-w-[1600px] gap-2">
            {navItems.map((item) => {
              const isActive = isActivePath(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  className={`rounded-md px-3 py-3 text-base font-black transition hover:bg-ink/5 ${isActive ? "bg-petrol/8 text-petrol" : "text-ink"}`}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
