"use client";
import { use } from "react";
import ContentForm from "@/components/ContentForm";
import { CONTENT_CONFIG } from "@/lib/contentConfig";

export default function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ContentForm config={CONTENT_CONFIG.guides} id={id} />;
}
