import type { MetadataRoute } from "next";
import { mockNews } from "@/mocks/news";
import { getCities } from "@/lib/api/cities";
import { getProvinces } from "@/lib/api/provinces";
import { getStations } from "@/lib/api/stations";
import { latestCommunicationTime } from "@/lib/price";
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
import { BRAND_PAGES, brandPath } from "@/lib/brand-pages";

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

/** Data dell'ultimo prezzo disponibile (dai distributori della provincia di Milano, gia' scaricati dal build). */
async function latestDataDate(): Promise<Date> {
  try {
    const provinces = await getProvinces();
    const milano = provinces.find((province) => province.name.toLowerCase() === "milano");
    const latest = milano ? latestCommunicationTime(await getStations({ provinceId: milano.id, limit: 1500 })) : 0;
    return latest ? new Date(latest) : new Date();
  } catch {
    return new Date();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seoCities = getSeoCities(await getCities());
  // lastmod delle pagine con i prezzi = data dell'ultimo prezzo disponibile, non del build:
  // un build senza dati nuovi non deve far credere a Google che 700 pagine siano cambiate.
  const dataDate = await latestDataDate();

  // Pagine presenti in tutte le lingue: Home, Mappa, indice prezzi per citta.
  const sharedRoutes: MetadataRoute.Sitemap = LOCALES.flatMap((locale) => {
    const routes = LOCALE_ROUTES[locale];
    const isItalian = locale === "it";
    return [
      { url: pageUrl(routes.home), lastModified: dataDate, changeFrequency: "daily" as const, priority: isItalian ? 1 : 0.8, alternates: languageUrls(homeAlternates()) },
      { url: pageUrl(routes.map), lastModified: dataDate, changeFrequency: "daily" as const, priority: isItalian ? 0.9 : 0.7, alternates: languageUrls(mapAlternates()) },
      { url: pageUrl(routes.fuelIndex), lastModified: dataDate, changeFrequency: "weekly" as const, priority: isItalian ? 0.8 : 0.6, alternates: languageUrls(fuelIndexAlternates()) }
    ];
  });

  // Pagine citta: in italiano tutti i capoluoghi, in inglese e spagnolo i capoluoghi di regione.
  const cityRoutes: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    seoCities
      .filter((city) => locale === "it" || isTranslatedCity(city.slug))
      .flatMap((city) =>
        LOCALIZED_FUELS.map((fuel) => ({
          url: pageUrl(cityFuelPathFor(locale, fuel, city.slug)),
          lastModified: dataDate,
          changeFrequency: "daily" as const,
          priority: locale === "it" ? FUEL_PRIORITY[fuel] : 0.6,
          alternates: languageUrls(cityFuelAlternates(fuel, city.slug))
        }))
      )
  );

  const latestNewsDate = mockNews.map((article) => article.date).sort().at(-1);
  const italianOnlyRoutes: MetadataRoute.Sitemap = [
    { url: pageUrl("/accise-benzina"), lastModified: "2026-10-01", changeFrequency: "monthly", priority: 0.7 },
    { url: pageUrl("/notizie"), lastModified: latestNewsDate, changeFrequency: "weekly", priority: 0.6 },
    { url: pageUrl("/chi-siamo"), lastModified: "2026-10-01", changeFrequency: "yearly", priority: 0.4 },
    { url: pageUrl("/segnala-prezzo"), lastModified: "2026-09-23", changeFrequency: "monthly", priority: 0.4 },
    { url: pageUrl("/privacy"), lastModified: "2026-10-01", changeFrequency: "yearly", priority: 0.1 },
    { url: pageUrl("/cookie-policy"), lastModified: "2026-09-29", changeFrequency: "yearly", priority: 0.1 },
    ...BRAND_PAGES.map((brand) => ({ url: pageUrl(brandPath(brand.slug)), lastModified: dataDate, changeFrequency: "daily" as const, priority: 0.7 }))
  ];

  const newsRoutes: MetadataRoute.Sitemap = mockNews.map((article) => ({
    url: pageUrl(`/notizie/${article.slug}`),
    lastModified: article.date,
    changeFrequency: "monthly",
    priority: 0.5
  }));

  return [...sharedRoutes, ...cityRoutes, ...italianOnlyRoutes, ...newsRoutes];
}
