import Link from "next/link";
import { getList } from "@/lib/api";
import FeaturedHero from "@/components/FeaturedHero";
import ArticleCard from "@/components/ArticleCard";
import ArticleGrid from "@/components/ArticleGrid";
import SectionHeader from "@/components/SectionHeader";

// ISR: sahifa 60 soniyada bir marta qayta yasaladi
export const revalidate = 60;

export default async function HomePage() {
  // Barcha ma'lumotlarni parallel olamiz
  const [news, guides, opinions] = await Promise.all([
    getList("news", { limit: 5, sort: "publishedAt", order: "desc" }),
    getList("guides", { limit: 3, sort: "publishedAt", order: "desc" }),
    getList("opinions", { limit: 3, sort: "publishedAt", order: "desc" }),
  ]);

  const featured = news.items[0];
  const restNews = news.items.slice(1, 5);

  const nothing =
    !news.items.length && !guides.items.length && !opinions.items.length;

  return (
    <div className="container-content py-10 sm:py-14">
      {/* Hero */}
      <section className="animate-fade-up">
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow mb-3">Gaming olami</p>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            O'yinlar haqida.
            <br />
            <span className="text-ink-soft">Aniq va chiroyli.</span>
          </h1>
          <p className="mt-5 text-base text-ink-soft sm:text-lg">
            Eng so'nggi yangiliklar, chuqur qo'llanmalar va halol fikrlar —
            barchasi bir joyda.
          </p>
        </div>

        {featured && <FeaturedHero item={featured} type="news" />}
      </section>

      {nothing && (
        <div className="rounded-2xl border border-dashed border-line py-20 text-center text-ink-soft">
          <p className="text-lg font-medium text-ink">Hali kontent yo'q</p>
          <p className="mt-2 text-sm">
            Admin panel orqali birinchi materialni chop eting — u shu yerda
            paydo bo'ladi.
          </p>
        </div>
      )}

      {/* So'nggi yangiliklar */}
      {restNews.length > 0 && (
        <section className="mt-20">
          <SectionHeader
            eyebrow="Yangiliklar"
            title="So'nggi yangiliklar"
            href="/news"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {restNews.map((item) => (
              <ArticleCard key={item.id} item={item} type="news" />
            ))}
          </div>
        </section>
      )}

      {/* Qo'llanmalar */}
      {guides.items.length > 0 && (
        <section className="mt-20">
          <SectionHeader
            eyebrow="Qo'llanmalar"
            title="Foydali qo'llanmalar"
            href="/guides"
          />
          <ArticleGrid items={guides.items} type="guides" />
        </section>
      )}

      {/* Maqolalar */}
      {opinions.items.length > 0 && (
        <section className="mt-20">
          <SectionHeader
            eyebrow="Fikrlar"
            title="Maqola va mulohazalar"
            href="/opinions"
          />
          <ArticleGrid items={opinions.items} type="opinions" />
        </section>
      )}

      {/* CTA */}
      <section className="mt-24 rounded-3xl bg-ink px-6 py-16 text-center text-white sm:py-20">
        <h2 className="mx-auto max-w-2xl text-2xl font-semibold tracking-tight sm:text-4xl">
          Gaming olamidan xabardor bo'ling
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-white/70 sm:text-base">
          Eng qiziqarli yangiliklar va qo'llanmalarni birinchilardan bo'lib
          o'qing.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/news"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-ink transition hover:opacity-90"
          >
            Yangiliklarni ko'rish
          </Link>
        </div>
      </section>
    </div>
  );
}
