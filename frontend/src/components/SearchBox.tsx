"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Qidiruv maydoni.
 *
 * Natija sahifasi serverda chiziladi, shuning uchun so'rov URL'ga yoziladi
 * (`/posts?q=...`) — havolani ulashish, orqaga qaytish va sahifani yangilash
 * ishlaydi. Joriy tur va kategoriya filtrlari saqlanadi: qidiruv ularni
 * bekor qilmasligi kerak.
 */
export default function SearchBox({
  defaultValue = "",
  current = {},
  placeholder = "Maqola qidirish...",
}: {
  defaultValue?: string;
  current?: { type?: string; category?: string };
  placeholder?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const sp = new URLSearchParams();
    if (current.type) sp.set("type", current.type);
    if (current.category) sp.set("category", current.category);

    const q = value.trim();
    if (q) sp.set("q", q);

    const query = sp.toString();
    router.push(query ? `/posts?${query}` : "/posts");
  }

  return (
    <form onSubmit={submit} className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Qidiruv"
        className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-24 text-sm outline-none transition focus:border-line-strong"
      />

      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
      </svg>

      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {defaultValue && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              const sp = new URLSearchParams();
              if (current.type) sp.set("type", current.type);
              if (current.category) sp.set("category", current.category);
              const query = sp.toString();
              router.push(query ? `/posts?${query}` : "/posts");
            }}
            className="rounded-lg px-2 py-1.5 text-[12px] text-ink-faint transition hover:text-ink"
          >
            Tozalash
          </button>
        )}
        <button type="submit" className="btn-primary px-3 py-1.5 text-[12px]">
          Qidirish
        </button>
      </div>
    </form>
  );
}
