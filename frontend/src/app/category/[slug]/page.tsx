import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPosts, getCategories } from "@/lib/api";
import ArticleGrid from "@/components/ArticleGrid";
import Pagination from "@/components/Pagination";

/**
 * Kategoriya sahifasi.
 *
 * Backend kategoriya bo'yicha filtrni ancha oldin qo'llab-quvvatlagan, lekin
 * saytda unga havola yo'q edi: o'quvchi "Esports" yozuvini ko'rar, bosolmasdi.
 * Endi har kategoriya o'z manziliga ega — bu SEO uchun ham muhim, chunki
 * mavzu bo'yicha qidirgan odam to'g'ridan-to'g'ri shu sahifaga tushadi.
 */

const PER_PAGE = 9;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function findCategory(slug: string) {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategory(slug);
  if (!category) return { title: "Kategoriya topilmadi" };

  return {
    title: category.name,
    description: `${category.name} bo'limidagi barcha materiallar: yangiliklar, qo'llanmalar va tahlillar.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const category = await findCategory(slug);
  if (!category) notFound();

  const { items, meta } = await getPosts({
    page,
    limit: PER_PAGE,
    category: slug,
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
        <p className="eyebrow mb-3">Kategoriya</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {category.name}
        </h1>
        <p className="mt-4 text-base text-ink-soft">
          {meta?.total ?? items.length} ta material
        </p>
      </header>

      <ArticleGrid
        items={items}
        type="news"
        emptyText="Bu kategoriyada hozircha material yo'q."
      />

      {meta && (
        <Pagination
          basePath={`/category/${slug}`}
          page={meta.page}
          totalPages={meta.totalPages}
        />
      )}
    </div>
  );
}
