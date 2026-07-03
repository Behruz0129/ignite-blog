import type { Metadata } from "next";
import type { ContentItem, ContentType } from "./types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

// Bitta material uchun SEO metadata (title, description, OG image, canonical).
export function buildArticleMetadata(
  item: ContentItem | null,
  type: ContentType
): Metadata {
  if (!item) {
    return { title: "Topilmadi" };
  }

  const title = item.metaTitle || item.title;
  const description =
    item.metaDescription ||
    item.excerpt ||
    "Ignite — gaming yangiliklari va qo'llanmalari.";
  const canonical = `${SITE_URL}/${type}/${item.slug}`;
  const image = item.featuredImage || undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: image ? [{ url: image }] : undefined,
      publishedTime: item.publishedAt || item.createdAt,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
