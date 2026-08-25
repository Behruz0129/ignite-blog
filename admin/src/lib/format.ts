/**
 * FORMATLASH YORDAMCHILARI
 * ------------------------
 * Sana va izoh muallifi nomini bir joyda hal qilamiz.
 */

import type { Comment } from "./types";

const OYLAR = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];

// Sana qismlarini qat'iy Asia/Tashkent mintaqasida ajratamiz.
// "uz" lokali ko'p brauzerlarda to'liq oy nomiga ega emas ("2026 M08 25"),
// shuning uchun raqamli qismlarni olib, oy nomini o'zimiz qo'yamiz.
const parts = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Tashkent",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function split(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;

  const p = parts.formatToParts(d);
  const get = (type: string) => p.find((x) => x.type === type)?.value ?? "";
  const day = Number(get("day"));
  const month = Number(get("month"));
  const year = get("year");
  if (!day || !month || !year) return null;

  return { day, month, year, hour: get("hour"), minute: get("minute") };
}

/** 25-avgust, 2026 */
export function formatDate(dateStr?: string | null): string {
  const s = split(dateStr);
  if (!s) return "";
  return `${s.day}-${OYLAR[s.month - 1]}, ${s.year}`;
}

/** 25.08.2026 — jadvallarda ixcham ko'rinish uchun */
export function formatDateShort(dateStr?: string | null): string {
  const s = split(dateStr);
  if (!s) return "";
  const dd = String(s.day).padStart(2, "0");
  const mm = String(s.month).padStart(2, "0");
  return `${dd}.${mm}.${s.year}`;
}

/** 25-avgust, 2026 · 14:30 */
export function formatDateTime(dateStr?: string | null): string {
  const s = split(dateStr);
  if (!s) return "";
  return `${s.day}-${OYLAR[s.month - 1]}, ${s.year} · ${s.hour}:${s.minute}`;
}

/**
 * Izoh muallifi nomi.
 * Ro'yxatdan o'tgan foydalanuvchida authorName saqlanadi, lekin eski yoki
 * tashqaridan kiritilgan yozuvlarda u bo'sh bo'lishi mumkin — shunda
 * bog'langan user'dan olamiz, u ham bo'lmasa "Mehmon".
 */
export function commentAuthor(c: Comment): string {
  return c.authorName?.trim() || c.user?.name?.trim() || "Mehmon";
}

/** Izoh muallifi emaili (bo'lmasa bo'sh satr). */
export function commentEmail(c: Comment): string {
  return c.authorEmail?.trim() || "";
}

/** Ism bosh harfi — avatar o'rniga. */
export function initial(name: string): string {
  return (name.trim()[0] || "?").toUpperCase();
}
