import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBySlug } from "@/lib/api";
import { buildArticleMetadata } from "@/lib/metadata";
import ContentArticle from "@/components/ContentArticle";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getBySlug("news", slug);
  return buildArticleMetadata(item, "news");
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getBySlug("news", slug);
  if (!item) notFound();
  return <ContentArticle item={item} type="news" />;
}
