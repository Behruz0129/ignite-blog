import type { Metadata } from "next";
import Image from "next/image";
import { getResources } from "@/lib/api";

/**
 * Foydali resurslar — tashqi havolalar to'plami.
 *
 * Maqolalardan alohida bo'lim: bu yerda o'qish emas, "boshqa joyga o'tish"
 * asosiy amal. Shuning uchun har kartochka butunlay havola va yangi oynada
 * ochiladi.
 */

export const metadata: Metadata = {
  title: "Foydali resurslar",
  description:
    "Gaming bilan bog'liq foydali saytlar, asboblar va kanallar to'plami — bir joyda yig'ilgan.",
  alternates: { canonical: "/resources" },
};

// Ro'yxat kamdan-kam o'zgaradi, lekin admin qo'shgan narsa uzoq kutmasin.
export const revalidate = 300;

export default async function ResourcesPage() {
  const data = await getResources();

  return (
    <div className="container-content py-12 sm:py-16">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow mb-3">Ignite</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Foydali resurslar
        </h1>
        <p className="mt-4 text-base text-ink-soft">
          O&apos;yinchilar uchun tanlangan saytlar, asboblar va kanallar.
        </p>
      </header>

      {data.groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-16 text-center text-sm text-ink-soft">
          Hozircha resurs qo&apos;shilmagan.
        </div>
      ) : (
        <div className="space-y-12">
          {data.groups.map((group) => (
            <section key={group.name}>
              <h2 className="mb-5 text-sm font-medium uppercase tracking-wide text-ink-faint">
                {group.name}
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="group flex gap-4 rounded-2xl border border-line p-4 transition hover:border-line-strong hover:shadow-pop"
                  >
                    <span className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-line bg-canvas">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-lg text-ink-faint">
                          {item.title.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-start gap-1.5">
                        <span className="line-clamp-1 font-medium text-ink">
                          {item.title}
                        </span>
                        <svg
                          aria-hidden
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-ink-faint transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                        >
                          <path d="M7 17L17 7M17 7H8M17 7v9" strokeLinecap="round" />
                        </svg>
                      </span>

                      {item.description && (
                        <span className="mt-1 line-clamp-2 block text-[13px] leading-5 text-ink-soft">
                          {item.description}
                        </span>
                      )}

                      <span className="mt-1.5 block truncate text-[12px] text-ink-faint">
                        {hostOf(item.url)}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** Havoladan faqat domenni ko'rsatamiz — uzun URL kartochkani buzmasin. */
function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
