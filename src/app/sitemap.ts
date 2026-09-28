import type { MetadataRoute } from "next";
import { mockNews } from "@/mocks/news";
import { getCities } from "@/lib/api/cities";
import { siteUrl } from "@/lib/seo";
import { getSeoCities } from "@/lib/seo-cities";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cities = await getCities();
  const cityRoutes = getSeoCities(cities).flatMap((city) => [
    `/prezzo-benzina/${city.slug}`,
    `/prezzo-diesel/${city.slug}`,
    `/prezzo-gpl/${city.slug}`,
    `/storico-prezzo-benzina/${city.slug}`
  ]);
  const staticRoutes = ["/", "/mappa", "/segnala-prezzo", "/privacy", "/cookie-policy", "/accise-benzina", "/notizie"];
  const newsRoutes = mockNews.map((article) => ({
    url: `${siteUrl}/notizie/${article.slug}`,
    lastModified: article.date
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`
    })),
    ...cityRoutes.map((route) => ({
      url: `${siteUrl}${route}`
    })),
    ...newsRoutes
  ];
}
