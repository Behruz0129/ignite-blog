"use client";
import ContentList from "@/components/ContentList";
import { CONTENT_CONFIG } from "@/lib/contentConfig";

export default function NewsListPage() {
  return <ContentList config={CONTENT_CONFIG.news} />;
}
