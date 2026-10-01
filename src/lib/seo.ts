import type { Metadata } from "next";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { City } from "@/types/location";
import { cityFuelAlternates, cityFuelPathFor, localizedCityName, openGraphLocale, type Locale, type LocalizedFuel } from "@/lib/i18n";

export const siteName = "TrovaBenzina";
export const siteUrl = "https://www.trovabenzina.it";
export const defaultOgImage = "/brand/trovabenzina-concept.png";

/** Autore del progetto: pagina Chi siamo e dati strutturati (chi c'e' dietro il sito conta per Google). */
export const founder = {
  name: "Hugo Aldo Reynoso",
  jobTitle: "Senior Full-Stack Developer",
  email: "HugoAldoReynoso@gmail.com",
  linkedin: "https://www.linkedin.com/in/hugo-aldo-reynoso/",
  github: "https://github.com/HugoReynoso",
  website: "https://hugoreynoso.github.io/"
};

export const fuelSeo: Record<
  FuelTypeCode,
  { label: string; titleLabel: string; serviceMode: ServiceMode; routePrefix: string }
> = {
  BENZINA: {
    label: "benzina",
    titleLabel: "Benzina",
    serviceMode: "self",
    routePrefix: "prezzo-benzina"
  },
  DIESEL: {
    label: "diesel",
    titleLabel: "Diesel",
    serviceMode: "self",
    routePrefix: "prezzo-diesel"
  },
  GPL: {
    label: "GPL",
    titleLabel: "GPL",
    serviceMode: "served",
    routePrefix: "prezzo-gpl"
  },
  // Il metano e' quasi sempre al servito.
  METANO: {
    label: "metano",
    titleLabel: "Metano",
    serviceMode: "served",
    routePrefix: "prezzo-metano"
  }
};

/** Indirizzo assoluto di una pagina, con "/" finale come i canonical (il sito usa trailingSlash). */
export function absoluteUrl(path: string): string {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`}`;
}

export function cityFuelPath(fuelType: FuelTypeCode, citySlug: string): string {
  return `/${fuelSeo[fuelType].routePrefix}/${citySlug}`;
}

const CITY_META: Record<Locale, (fuel: LocalizedFuel, city: string) => { title: string; description: string; alt: string }> = {
  it: (fuel, city) => ({
    title: `Prezzo ${fuelSeo[fuel].titleLabel} ${city} Oggi: distributori economici`,
    description: `Confronta i prezzi ${fuelSeo[fuel].label} a ${city}. Trova distributori convenienti, prezzi self-service o servito, mappa e ultime comunicazioni disponibili MIMIT.`,
    alt: `${siteName} - prezzi carburante a ${city}`
  }),
  en: (fuel, city) => {
    const name = { BENZINA: "Petrol", DIESEL: "Diesel", GPL: "LPG", METANO: "CNG" }[fuel];
    return {
      title: `${name} Price in ${city} Today: Cheapest Fuel Stations`,
      description: `Compare today's ${fuel === "GPL" || fuel === "METANO" ? name : name.toLowerCase()} prices in ${city}, Italy: cheapest fuel stations, self-service and full-service prices, map and official MIMIT data.`,
      alt: `${siteName} - fuel prices in ${city}`
    };
  },
  es: (fuel, city) => {
    const name = { BENZINA: "de la gasolina", DIESEL: "del diésel", GPL: "del GLP", METANO: "del GNC" }[fuel];
    return {
      title: `Precio ${name} en ${city} hoy: gasolineras más baratas`,
      description: `Compara el precio ${name} hoy en ${city} (Italia): gasolineras más baratas, precios en autoservicio y atendido, mapa y datos oficiales del MIMIT.`,
      alt: `${siteName} - precios del combustible en ${city}`
    };
  }
};

export function buildCityFuelMetadata(city: City, fuelType: LocalizedFuel, locale: Locale = "it"): Metadata {
  const path = cityFuelPathFor(locale, fuelType, city.slug);
  const { title, description, alt } = CITY_META[locale](fuelType, localizedCityName(locale, city));
  const languages = cityFuelAlternates(fuelType, city.slug);

  return {
    title,
    description,
    alternates: { canonical: path, ...(languages ? { languages } : {}) },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: path,
      siteName,
      type: "website",
      locale: openGraphLocale(locale),
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultOgImage]
    }
  };
}

/** Ogni voce deve avere un indirizzo: Google segnala come errore le voci senza "item". */
export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}
