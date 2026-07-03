import type { ContentItem, ContentType } from "@/lib/types";
import ArticleCard from "./ArticleCard";

interface Props {
  items: ContentItem[];
  type: ContentType;
  emptyText?: string;
}

export default function ArticleGrid({
  items,
  type,
  emptyText = "Hozircha materiallar yo'q.",
}: Props) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line py-16 text-center text-sm text-ink-soft">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ArticleCard key={item.id} item={item} type={type} />
      ))}
    </div>
  );
}
