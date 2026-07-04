import Link from "next/link";
import Image from "next/image";
import type { ContentItem, ContentType } from "@/lib/types";
import { formatDate, readingTime } from "@/lib/format";
import ArticleCardFooter from "./ArticleCardFooter";

interface Props {
  item: ContentItem;
  type: ContentType;
  // Katta ("featured") ko'rinish yoki oddiy
  featured?: boolean;
}

export default function ArticleCard({ item, type, featured = false }: Props) {
  const href = `/${type}/${item.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)]"
    >
      <div
        className={`relative w-full overflow-hidden bg-haze ${
          featured ? "aspect-[16/9]" : "aspect-[16/10]"
        }`}
      >
        {item.featuredImage ? (
          <Image
            src={item.featuredImage}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-semibold tracking-tight text-line">
            IGNITE
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-soft">
          {item.categories?.slice(0, 1).map((c) => (
            <span key={c.id} className="eyebrow">
              {c.name}
            </span>
          ))}
          <span>·</span>
          <span>{formatDate(item.publishedAt || item.createdAt)}</span>
        </div>

        <h3
          className={`font-semibold tracking-tight text-ink ${
            featured ? "text-2xl" : "text-lg"
          }`}
        >
          {item.title}
        </h3>

        {item.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
            {item.excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 text-[12px] text-ink-soft">
          <span>{readingTime(item.content)} daqiqa o&apos;qish</span>
          <ArticleCardFooter
            contentId={item.id}
            type={type}
            likeCount={item._count?.likes}
            likedByMe={item.likedByMe}
          />
          <span className="ml-auto inline-flex items-center gap-1 font-medium text-ink transition group-hover:gap-2">
            O&apos;qish →
          </span>
        </div>
      </div>
    </Link>
  );
}
