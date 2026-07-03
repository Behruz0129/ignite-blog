import type { MetadataRoute } from "next";
import { getList } from "@/lib/api";
import type { ContentType } from "@/lib/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

export const revalidate = 3600; // sitemap soatiga bir marta yangilanadi

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const types: ContentType[] = ["news", "guides", "opinions"];

  // Har bir turdan ko'p elementlarni olamiz (SEO indekslash uchun)
  const lists = await Promise.all(
    types.map((t) => getList(t, { limit: 100, sort: "publishedAt", order: "desc" }))
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/news`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/guides`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/opinions`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = types.flatMap((t, i) =>
    lists[i].items.map((item) => ({
      url: `${SITE_URL}/${t}/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  return [...staticRoutes, ...dynamicRoutes];
}
