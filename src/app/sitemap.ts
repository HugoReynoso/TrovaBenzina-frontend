import type { MetadataRoute } from "next";
import { mockNews } from "@/mocks/news";
import { getCities } from "@/lib/api/cities";
import { getSeoCities } from "@/lib/seo-cities";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.trovabenzina.it";
  const cities = await getCities();
  const cityRoutes = getSeoCities(cities).flatMap((city) => [
    `/prezzo-benzina/${city.slug}`,
    `/prezzo-diesel/${city.slug}`,
    `/prezzo-gpl/${city.slug}`,
    `/storico-prezzo-benzina/${city.slug}`
  ]);
  const newsRoutes = ["/notizie", ...mockNews.map((article) => `/notizie/${article.slug}`)];

  return ["/", "/segnala-prezzo", "/privacy", "/cookie-policy", "/accise-benzina", ...cityRoutes, ...newsRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date()
  }));
}
