import Link from "next/link";
import Image from "next/image";
import type { ContentItem, ContentType } from "@/lib/types";
import { formatDate, readingTime } from "@/lib/format";

// Bosh sahifadagi katta "featured" material.
export default function FeaturedHero({
  item,
  type,
}: {
  item: ContentItem;
  type: ContentType;
}) {
  const href = `/${type}/${item.slug}`;
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-3xl border border-line bg-haze"
    >
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
        {item.featuredImage ? (
          <Image
            src={item.featuredImage}
            alt={item.title}
            fill
            priority
            sizes="100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-semibold tracking-tight text-line">
            IGNITE
          </div>
        )}
        {/* Pastdan yuqoriga qoraygan qatlam (matn o'qilishi uchun) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
            {item.categories?.slice(0, 1).map((c) => (
              <span key={c.id}>{c.name}</span>
            ))}
            <span>·</span>
            <span>{formatDate(item.publishedAt || item.createdAt)}</span>
          </div>
          <h1 className="max-w-3xl text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            {item.title}
          </h1>
          {item.excerpt && (
            <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
              {item.excerpt}
            </p>
          )}
          <p className="mt-4 text-[13px] text-white/70">
            {readingTime(item.content)} daqiqa o'qish
          </p>
        </div>
      </div>
    </Link>
  );
}
