import type { MetadataRoute } from "next";
import { mockNews } from "@/mocks/news";
import { getCities } from "@/lib/api/cities";
import { siteUrl } from "@/lib/seo";
import { getSeoCities } from "@/lib/seo-cities";

export const dynamic = "force-static";

// Il sito usa trailingSlash: true, quindi gli indirizzi della sitemap devono finire con "/"
// esattamente come i canonical delle pagine.
function pageUrl(path: string): string {
  const withSlash = path.endsWith("/") ? path : `${path}/`;
  return `${siteUrl}${withSlash}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const buildDate = new Date();
  const cities = await getCities();

  const cityRoutes: MetadataRoute.Sitemap = getSeoCities(cities).flatMap((city) => [
    { url: pageUrl(`/prezzo-benzina/${city.slug}`), lastModified: buildDate, changeFrequency: "daily", priority: 0.8 },
    { url: pageUrl(`/prezzo-diesel/${city.slug}`), lastModified: buildDate, changeFrequency: "daily", priority: 0.8 },
    { url: pageUrl(`/prezzo-gpl/${city.slug}`), lastModified: buildDate, changeFrequency: "daily", priority: 0.7 },
    { url: pageUrl(`/storico-prezzo-benzina/${city.slug}`), lastModified: buildDate, changeFrequency: "weekly", priority: 0.5 }
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: pageUrl("/"), lastModified: buildDate, changeFrequency: "daily", priority: 1 },
    { url: pageUrl("/mappa"), lastModified: buildDate, changeFrequency: "daily", priority: 0.9 },
    { url: pageUrl("/prezzi-carburanti"), lastModified: buildDate, changeFrequency: "weekly", priority: 0.8 },
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

  return [...staticRoutes, ...cityRoutes, ...newsRoutes];
}
