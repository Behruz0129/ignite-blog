import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPosts, getTags } from "@/lib/api";
import ArticleGrid from "@/components/ArticleGrid";
import Pagination from "@/components/Pagination";

/**
 * Teg sahifasi — kategoriya sahifasining teglar uchun ko'rinishi.
 * Maqola ostidagi teglar shu yerga olib keladi.
 */

const PER_PAGE = 9;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function findTag(slug: string) {
  const tags = await getTags();
  return tags.find((t) => t.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await findTag(slug);
  if (!tag) return { title: "Teg topilmadi" };

  return {
    title: `#${tag.name}`,
    description: `${tag.name} tegiga tegishli barcha materiallar.`,
    alternates: { canonical: `/tag/${tag.slug}` },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const tag = await findTag(slug);
  if (!tag) notFound();

  const { items, meta } = await getPosts({
    page,
    limit: PER_PAGE,
    tag: slug,
    sort: "publishedAt",
    order: "desc",
  });

  return (
    <div className="container-content py-12 sm:py-16">
      <nav className="mb-6 text-[13px] text-ink-soft">
        <Link href="/posts" className="transition hover:text-ink">
          ← Barcha materiallar
        </Link>
      </nav>

      <header className="mb-10 max-w-2xl">
        <p className="eyebrow mb-3">Teg</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          #{tag.name}
        </h1>
        <p className="mt-4 text-base text-ink-soft">
          {meta?.total ?? items.length} ta material
        </p>
      </header>

      <ArticleGrid
        items={items}
        type="news"
        emptyText="Bu teg bilan hozircha material yo'q."
      />

      {meta && (
        <Pagination
          basePath={`/tag/${slug}`}
          page={meta.page}
          totalPages={meta.totalPages}
        />
      )}
    </div>
  );
}
