import type { FuelTypeCode } from "@/types/fuel";

export type Locale = "it" | "en" | "es";

export const DEFAULT_LOCALE: Locale = "it";

export const SUPPORTED_LOCALES = [
  { code: "it", label: "Italiano", shortLabel: "IT", intl: "it-IT", openGraph: "it_IT" },
  { code: "en", label: "English", shortLabel: "EN", intl: "en-GB", openGraph: "en_GB" },
  { code: "es", label: "Español", shortLabel: "ES", intl: "es-ES", openGraph: "es_ES" }
] as const satisfies ReadonlyArray<{ code: Locale; label: string; shortLabel: string; intl: string; openGraph: string }>;

export type SupportedLocale = Locale;

export function intlLocale(locale: Locale): string {
  return SUPPORTED_LOCALES.find((item) => item.code === locale)?.intl ?? "it-IT";
}

export function openGraphLocale(locale: Locale): string {
  return SUPPORTED_LOCALES.find((item) => item.code === locale)?.openGraph ?? "it_IT";
}

export type LocalizedFuel = FuelTypeCode;

interface LocaleRoutes {
  home: string;
  map: string;
  fuelIndex: string;
  fuel: Record<LocalizedFuel, string>;
}

/** Percorsi delle pagine tradotte (senza "/" finale: Next lo aggiunge con trailingSlash). */
export const LOCALE_ROUTES: Record<Locale, LocaleRoutes> = {
  it: {
    home: "/",
    map: "/mappa",
    fuelIndex: "/prezzi-carburanti",
    fuel: { BENZINA: "/prezzo-benzina", DIESEL: "/prezzo-diesel", GPL: "/prezzo-gpl", METANO: "/prezzo-metano" }
  },
  en: {
    home: "/en",
    map: "/en/map",
    fuelIndex: "/en/fuel-prices",
    fuel: { BENZINA: "/en/petrol-price", DIESEL: "/en/diesel-price", GPL: "/en/lpg-price", METANO: "/en/cng-price" }
  },
  es: {
    home: "/es",
    map: "/es/mapa",
    fuelIndex: "/es/precios-combustible",
    fuel: { BENZINA: "/es/precio-gasolina", DIESEL: "/es/precio-diesel", GPL: "/es/precio-glp", METANO: "/es/precio-gnc" }
  }
};

export const LOCALIZED_FUELS: LocalizedFuel[] = ["BENZINA", "DIESEL", "GPL", "METANO"];

export function cityFuelPathFor(locale: Locale, fuel: LocalizedFuel, citySlug: string): string {
  return `${LOCALE_ROUTES[locale].fuel[fuel]}/${citySlug}`;
}

/**
 * Citta con pagine prezzo anche in inglese e spagnolo: i capoluoghi di regione
 * (le mete piu' cercate da turisti e stranieri). Aggiungi qui uno slug per tradurre altre citta.
 */
export const TRANSLATED_CITY_SLUGS = [
  "aosta",
  "torino",
  "genova",
  "milano",
  "trento",
  "bolzano",
  "venezia",
  "trieste",
  "bologna",
  "firenze",
  "perugia",
  "ancona",
  "roma",
  "l-aquila",
  "campobasso",
  "napoli",
  "potenza",
  "bari",
  "catanzaro",
  "palermo",
  "cagliari"
];

export function isTranslatedCity(citySlug: string): boolean {
  return TRANSLATED_CITY_SLUGS.includes(citySlug);
}

/** Nomi delle citta nelle altre lingue (se non presenti si usa il nome italiano). */
const CITY_EXONYMS: Record<Exclude<Locale, "it">, Record<string, string>> = {
  en: {
    roma: "Rome",
    milano: "Milan",
    napoli: "Naples",
    torino: "Turin",
    firenze: "Florence",
    venezia: "Venice",
    genova: "Genoa",
    bolzano: "Bolzano",
    padova: "Padua",
    mantova: "Mantua",
    siracusa: "Syracuse"
  },
  es: {
    roma: "Roma",
    milano: "Milán",
    napoli: "Nápoles",
    torino: "Turín",
    firenze: "Florencia",
    venezia: "Venecia",
    genova: "Génova",
    padova: "Padua",
    mantova: "Mantua",
    siracusa: "Siracusa",
    "l-aquila": "L'Aquila"
  }
};

export function localizedCityName(locale: Locale, city: { slug: string; name: string }): string {
  if (locale === "it") {
    return city.name;
  }
  return CITY_EXONYMS[locale][city.slug] ?? city.name;
}

export function localeFromPathname(pathname: string): Locale {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return "en";
  }
  if (pathname === "/es" || pathname.startsWith("/es/")) {
    return "es";
  }
  return "it";
}

function normalizePath(path: string): string {
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

type PageRef =
  | { kind: "home" }
  | { kind: "map" }
  | { kind: "fuelIndex" }
  | { kind: "cityFuel"; fuel: LocalizedFuel; citySlug: string };

function identifyPage(pathname: string): PageRef | null {
  const path = normalizePath(pathname);
  const locale = localeFromPathname(path);
  const routes = LOCALE_ROUTES[locale];

  if (path === normalizePath(routes.home)) {
    return { kind: "home" };
  }
  if (path === routes.map) {
    return { kind: "map" };
  }
  if (path === routes.fuelIndex) {
    return { kind: "fuelIndex" };
  }
  for (const fuel of LOCALIZED_FUELS) {
    const prefix = `${routes.fuel[fuel]}/`;
    if (path.startsWith(prefix)) {
      const citySlug = path.slice(prefix.length).split("/")[0];
      if (citySlug) {
        return { kind: "cityFuel", fuel, citySlug };
      }
    }
  }
  return null;
}

function pathForPage(locale: Locale, page: PageRef): string {
  const routes = LOCALE_ROUTES[locale];
  switch (page.kind) {
    case "home":
      return routes.home;
    case "map":
      return routes.map;
    case "fuelIndex":
      return routes.fuelIndex;
    case "cityFuel":
      // Le pagine citta in EN/ES esistono solo per le citta tradotte.
      if (locale === "it" || isTranslatedCity(page.citySlug)) {
        return cityFuelPathFor(locale, page.fuel, page.citySlug);
      }
      return routes.fuelIndex;
  }
}

/** Indirizzo della stessa pagina nella lingua scelta (per il selettore di lingua). */
export function equivalentPath(pathname: string, target: Locale): string {
  const page = identifyPage(pathname);
  const path = page ? pathForPage(target, page) : LOCALE_ROUTES[target].home;
  return path === "/" ? "/" : `${path}/`;
}

/** Link hreflang (alternates.languages) per una pagina disponibile in tutte le lingue. */
export function languageAlternates(page: PageRef): Record<string, string> {
  return {
    "it-IT": pathForPage("it", page),
    "en-GB": pathForPage("en", page),
    "es-ES": pathForPage("es", page),
    "x-default": pathForPage("it", page)
  };
}

export function homeAlternates() {
  return languageAlternates({ kind: "home" });
}

export function mapAlternates() {
  return languageAlternates({ kind: "map" });
}

export function fuelIndexAlternates() {
  return languageAlternates({ kind: "fuelIndex" });
}

export function cityFuelAlternates(fuel: LocalizedFuel, citySlug: string): Record<string, string> | undefined {
  return isTranslatedCity(citySlug) ? languageAlternates({ kind: "cityFuel", fuel, citySlug }) : undefined;
}
