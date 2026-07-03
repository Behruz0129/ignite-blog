import { getList } from "@/lib/api";
import type { ContentType } from "@/lib/types";
import { TYPE_LABEL } from "@/lib/format";
import ArticleGrid from "./ArticleGrid";
import Pagination from "./Pagination";

const SUBTITLE: Record<ContentType, string> = {
  news: "Gaming olamidan eng so'nggi voqealar va e'lonlar.",
  guides: "Bosqichma-bosqich qo'llanmalar va maslahatlar.",
  opinions: "Mualliflarning fikr va tahlillari.",
};

// News/Guides/Opinions ro'yxat sahifasi uchun umumiy komponent.
export default async function ContentIndex({
  type,
  page,
}: {
  type: ContentType;
  page: number;
}) {
  const { items, meta } = await getList(type, {
    page,
    limit: 9,
    sort: "publishedAt",
    order: "desc",
  });

  return (
    <div className="container-content py-12 sm:py-16">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow mb-3">Ignite</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {TYPE_LABEL[type]}
        </h1>
        <p className="mt-4 text-base text-ink-soft">{SUBTITLE[type]}</p>
      </header>

      <ArticleGrid items={items} type={type} />

      {meta && (
        <Pagination
          basePath={`/${type}`}
          page={meta.page}
          totalPages={meta.totalPages}
        />
      )}
    </div>
  );
}
