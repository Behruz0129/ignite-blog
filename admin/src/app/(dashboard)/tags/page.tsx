"use client";
import TaxonomyManager from "@/components/TaxonomyManager";

export default function TagsPage() {
  return (
    <TaxonomyManager
      apiPath="/tags"
      title="Teglar"
      hint="Teg — kategoriyadan mayda belgi (masalan RPG, Update). O'quvchi shu orqali o'xshash materiallarni topadi."
    />
  );
}
