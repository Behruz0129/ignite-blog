import Link from "next/link";
import Image from "next/image";
import type { ContentItem, ContentType } from "@/lib/types";
import {
  formatDate,
  readingTime,
  TYPE_LABEL,
  DIFFICULTY_LABEL,
} from "@/lib/format";
import CommentSection from "./CommentSection";

// Bitta material (detal) sahifasi ko'rinishi.
export default function ContentArticle({
  item,
  type,
}: {
  item: ContentItem;
  type: ContentType;
}) {
  return (
    <article className="py-12 sm:py-16">
      <div className="container-content max-w-3xl">
        {/* Yuqori navigatsiya */}
        <Link
          href={`/${type}`}
          className="text-sm text-ink-soft transition hover:text-ink"
        >
          ← {TYPE_LABEL[type]}
        </Link>

        {/* Sarlavha bloki */}
        <header className="mt-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[12px] text-ink-soft">
            {item.categories?.map((c) => (
              <span key={c.id} className="eyebrow">
                {c.name}
              </span>
            ))}
            {type === "guides" && item.difficulty && (
              <span className="rounded-full bg-haze px-2.5 py-0.5 text-[11px] font-medium text-ink">
                {DIFFICULTY_LABEL[item.difficulty]}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {item.title}
          </h1>

          {item.excerpt && (
            <p className="mt-5 text-lg text-ink-soft">{item.excerpt}</p>
          )}

          <div className="mt-6 flex items-center gap-3 text-sm text-ink-soft">
            {item.author?.name && (
              <>
                <span className="font-medium text-ink">
                  {item.author.name}
                </span>
                <span>·</span>
              </>
            )}
            <span>{formatDate(item.publishedAt || item.createdAt)}</span>
            <span>·</span>
            <span>{readingTime(item.content)} daqiqa</span>
          </div>
        </header>
      </div>

      {/* Bosh rasm - kengroq */}
      {item.featuredImage && (
        <div className="container-content mt-10 max-w-4xl">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-haze">
            <Image
              src={item.featuredImage}
              alt={item.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Matn */}
      <div className="container-content mt-12 max-w-3xl">
        <div
          className="article-body prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-ink prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />

        {/* Teglar */}
        {item.tags && item.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-8">
            {item.tags.map((t) => (
              <span
                key={t.id}
                className="rounded-full bg-haze px-3 py-1 text-[13px] text-ink-soft"
              >
                #{t.name}
              </span>
            ))}
          </div>
        )}

        {/* Izohlar */}
        <CommentSection
          contentId={item.id}
          type={type}
          initialComments={item.comments ?? []}
        />
      </div>
    </article>
  );
}
