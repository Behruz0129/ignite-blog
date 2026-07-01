"use client";
import ContentForm from "@/components/ContentForm";
import { CONTENT_CONFIG } from "@/lib/contentConfig";

export default function NewNewsPage() {
  return <ContentForm config={CONTENT_CONFIG.news} />;
}
