import type { Metadata } from "next";
import Link from "next/link";
import { getPosts, getCategories } from "@/lib/api";
import ArticleGrid from "@/components/ArticleGrid";
import Pagination from "@/components/Pagination";
import SearchBox from "@/components/SearchBox";

/**
 * Barcha materiallar bitta oqimda.
 *
 * Ilgari yangiliklar, qo'llanmalar va maqolalar uchta alohida bo'lim edi va
 * o'quvchi qaysi bo'limda ekanini eslab yurishi kerak edi. Endi hammasi shu
 * yerda; tur, kategoriya va qidiruv — filtr sifatida.
 *
 * Filtrlar URL'da yashaydi (`?type=&category=&q=`), shuning uchun holat
 * saqlanadi: sahifani yangilash, orqaga qaytish va havolani ulashish ishlaydi.
 */

export const metadata: Metadata = {
  title: "Barcha materiallar",
  description:
    "Gaming yangiliklari, qo'llanmalar va tahlillar — barchasi bitta joyda. Turi, kategoriyasi bo'yicha filtrlang yoki qidiruvdan foydalaning.",
};

const TYPES = [
  { value: "", label: "Barchasi" },
  { value: "NEWS", label: "Yangiliklar" },
  { value: "GUIDE", label: "Qo'llanmalar" },
  { value: "OPINION", label: "Maqolalar" },
] as const;

const PER_PAGE = 9;

interface Props {
  searchParams: Promise<{
    page?: string;
    type?: string;
    category?: string;
    q?: string;
  }>;
}

/** Filtrni saqlab qolgan holda bitta parametrni almashtiradi. */
function buildHref(
  current: { type?: string; category?: string; q?: string },
  patch: { type?: string; category?: string }
): string {
  const sp = new URLSearchParams();
  const next = { ...current, ...patch };
  if (next.type) sp.set("type", next.type);
  if (next.category) sp.set("category", next.category);
  if (next.q) sp.set("q", next.q);
  const s = sp.toString();
  return s ? `/posts?${s}` : "/posts";
}

export default async function PostsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;
  const type = sp.type || "";
  const category = sp.category || "";
  const q = sp.q || "";

  const [{ items, meta }, categories] = await Promise.all([
    getPosts({
      page,
      limit: PER_PAGE,
      sort: "publishedAt",
      order: "desc",
      ...(type ? { type } : {}),
      ...(category ? { category } : {}),
      ...(q ? { search: q } : {}),
    }),
    getCategories(),
  ]);

  const current = { type, category, q };
  const total = meta?.total ?? items.length;

  return (
    <div className="container-content py-12 sm:py-16">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow mb-3">Ignite</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Barcha materiallar
        </h1>
        <p className="mt-4 text-base text-ink-soft">
          Yangiliklar, qo&apos;llanmalar va tahlillar — bitta oqimda.
        </p>
      </header>

      <div className="mb-8 space-y-4">
        <SearchBox defaultValue={q} current={{ type, category }} />

        {/* Tur filtri */}
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const active = type === t.value;
            return (
              <Link
                key={t.value || "all"}
                href={buildHref(current, { type: t.value })}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] transition ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        {/* Kategoriya filtri */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] uppercase tracking-wide text-ink-faint">
              Kategoriya
            </span>
            <Link
              href={buildHref(current, { category: "" })}
              className={`rounded-full px-3 py-1 text-[13px] transition ${
                !category ? "bg-canvas text-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              Barchasi
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={buildHref(current, { category: c.slug })}
                className={`rounded-full px-3 py-1 text-[13px] transition ${
                  category === c.slug
                    ? "bg-canvas text-ink"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mb-5 text-[13px] text-ink-soft">
        {q ? (
          <>
            <strong className="text-ink">{q}</strong> bo&apos;yicha {total} ta natija
          </>
        ) : (
          <>{total} ta material</>
        )}
      </div>

      <ArticleGrid
        items={items}
        type="news"
        emptyText={
          q
            ? "Bu so'rov bo'yicha hech narsa topilmadi. Boshqa so'z bilan urinib ko'ring."
            : "Bu filtr bo'yicha material yo'q."
        }
      />

      {meta && (
        <Pagination
          basePath={buildHref(current, {})}
          page={meta.page}
          totalPages={meta.totalPages}
        />
      )}
    </div>
  );
}
