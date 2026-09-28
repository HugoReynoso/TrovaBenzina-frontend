import type { Metadata } from "next";
import type { FuelTypeCode, ServiceMode } from "@/types/fuel";
import type { City } from "@/types/location";

export const siteName = "TrovaBenzina";
export const siteUrl = "https://www.trovabenzina.it";
export const defaultOgImage = "/brand/trovabenzina-concept.png";

export const fuelSeo: Record<
  Extract<FuelTypeCode, "BENZINA" | "DIESEL" | "GPL">,
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
  }
};

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function cityFuelPath(fuelType: Extract<FuelTypeCode, "BENZINA" | "DIESEL" | "GPL">, citySlug: string): string {
  return `/${fuelSeo[fuelType].routePrefix}/${citySlug}`;
}

export function buildCityFuelMetadata(city: City, fuelType: Extract<FuelTypeCode, "BENZINA" | "DIESEL" | "GPL">): Metadata {
  const fuel = fuelSeo[fuelType];
  const path = cityFuelPath(fuelType, city.slug);
  const title = `Prezzo ${fuel.titleLabel} ${city.name} Oggi: distributori economici`;
  const description = `Confronta i prezzi ${fuel.label} a ${city.name}. Trova distributori convenienti, prezzi self-service o servito, mappa e ultime comunicazioni disponibili MIMIT.`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: path,
      siteName,
      type: "website",
      locale: "it_IT",
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: `${siteName} - prezzi carburante a ${city.name}`
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

export function breadcrumbJsonLd(items: Array<{ name: string; path?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {})
    }))
  };
}
