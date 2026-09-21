import type { MetadataRoute } from "next";
import { mockCities } from "@/mocks/locations";
import { mockNews } from "@/mocks/news";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.trovabenzina.it";
  const cityRoutes = mockCities.flatMap((city) => [
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
