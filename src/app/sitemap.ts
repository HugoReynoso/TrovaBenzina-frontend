import type { MetadataRoute } from "next";
import { mockNews } from "@/mocks/news";
import { getCities } from "@/lib/api/cities";
import {
  cityFuelAlternates,
  cityFuelPathFor,
  fuelIndexAlternates,
  homeAlternates,
  isTranslatedCity,
  LOCALE_ROUTES,
  LOCALIZED_FUELS,
  mapAlternates,
  type Locale
} from "@/lib/i18n";
import { siteUrl } from "@/lib/seo";
import { getSeoCities } from "@/lib/seo-cities";

export const dynamic = "force-static";

// Il sito usa trailingSlash: true, quindi gli indirizzi della sitemap devono finire con "/"
// esattamente come i canonical delle pagine.
function pageUrl(path: string): string {
  const withSlash = path.endsWith("/") ? path : `${path}/`;
  return `${siteUrl}${withSlash}`;
}

/** Converte gli hreflang (percorsi) in indirizzi assoluti per la sitemap. */
function languageUrls(alternates: Record<string, string> | undefined) {
  if (!alternates) {
    return undefined;
  }
  return { languages: Object.fromEntries(Object.entries(alternates).map(([language, path]) => [language, pageUrl(path)])) };
}

const LOCALES: Locale[] = ["it", "en", "es"];
const FUEL_PRIORITY = { BENZINA: 0.8, DIESEL: 0.8, GPL: 0.7, METANO: 0.6 } as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const buildDate = new Date();
  const seoCities = getSeoCities(await getCities());

  // Pagine presenti in tutte le lingue: Home, Mappa, indice prezzi per citta.
  const sharedRoutes: MetadataRoute.Sitemap = LOCALES.flatMap((locale) => {
    const routes = LOCALE_ROUTES[locale];
    const isItalian = locale === "it";
    return [
      { url: pageUrl(routes.home), lastModified: buildDate, changeFrequency: "daily" as const, priority: isItalian ? 1 : 0.8, alternates: languageUrls(homeAlternates()) },
      { url: pageUrl(routes.map), lastModified: buildDate, changeFrequency: "daily" as const, priority: isItalian ? 0.9 : 0.7, alternates: languageUrls(mapAlternates()) },
      { url: pageUrl(routes.fuelIndex), lastModified: buildDate, changeFrequency: "weekly" as const, priority: isItalian ? 0.8 : 0.6, alternates: languageUrls(fuelIndexAlternates()) }
    ];
  });

  // Pagine citta: in italiano tutti i capoluoghi, in inglese e spagnolo i capoluoghi di regione.
  const cityRoutes: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    seoCities
      .filter((city) => locale === "it" || isTranslatedCity(city.slug))
      .flatMap((city) =>
        LOCALIZED_FUELS.map((fuel) => ({
          url: pageUrl(cityFuelPathFor(locale, fuel, city.slug)),
          lastModified: buildDate,
          changeFrequency: "daily" as const,
          priority: locale === "it" ? FUEL_PRIORITY[fuel] : 0.6,
          alternates: languageUrls(cityFuelAlternates(fuel, city.slug))
        }))
      )
  );

  const historyRoutes: MetadataRoute.Sitemap = seoCities.map((city) => ({
    url: pageUrl(`/storico-prezzo-benzina/${city.slug}`),
    lastModified: buildDate,
    changeFrequency: "weekly",
    priority: 0.5
  }));

  const italianOnlyRoutes: MetadataRoute.Sitemap = [
    { url: pageUrl("/accise-benzina"), changeFrequency: "monthly", priority: 0.6 },
    { url: pageUrl("/notizie"), changeFrequency: "weekly", priority: 0.6 },
    { url: pageUrl("/segnala-prezzo"), changeFrequency: "monthly", priority: 0.4 },
    { url: pageUrl("/privacy"), changeFrequency: "yearly", priority: 0.1 },
    { url: pageUrl("/cookie-policy"), changeFrequency: "yearly", priority: 0.1 }
  ];

  const newsRoutes: MetadataRoute.Sitemap = mockNews.map((article) => ({
    url: pageUrl(`/notizie/${article.slug}`),
    lastModified: article.date,
    changeFrequency: "monthly",
    priority: 0.5
  }));

  return [...sharedRoutes, ...cityRoutes, ...historyRoutes, ...italianOnlyRoutes, ...newsRoutes];
}
