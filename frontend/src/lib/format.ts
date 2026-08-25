import type { ContentType } from "./types";

// Oy nomlari qo'lda yozilgan: brauzerlarda "uz-UZ" uchun to'liq oy nomi
// ko'pincha yo'q va Intl "2026 M08 25" kabi natija qaytaradi. Serverdagi
// Node esa to'liq ICU bilan "25-avgust, 2026" beradi — bir xil komponent
// ikki xil chiqib, hydration xatosini keltirib chiqaradi.
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

// Sana qismlarini QAT'IY Asia/Tashkent mintaqasida ajratamiz.
// Raqamli format hamma joyda bir xil ishlaydi, shuning uchun server UTC'da
// tursa ham natija o'zgarmaydi.
const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Tashkent",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

// Sana formatlash (o'zbekcha): 25-avgust, 2026
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";

  const parts = partsFormatter.formatToParts(d);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const day = Number(get("day"));
  const month = Number(get("month"));
  const year = get("year");
  if (!day || !month || !year) return "";

  return `${day}-${OYLAR[month - 1]}, ${year}`;
}

// Taxminiy o'qish vaqti (daqiqa).
// Odatda backend uni tayyor holda beradi (`readingMinutes`) — ro'yxat
// endpointlari maqola matnini umuman yubormaydi. Agar biror sababga ko'ra
// kelmasa, mavjud matndan hisoblab beramiz.
export function readingTime(item: {
  readingMinutes?: number | null;
  content?: string | null;
}): number {
  if (item.readingMinutes && item.readingMinutes > 0) return item.readingMinutes;
  const text = (item.content || "").replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Kontent turi uchun o'zbekcha nom
export const TYPE_LABEL: Record<ContentType, string> = {
  news: "Yangiliklar",
  guides: "Qo'llanmalar",
  opinions: "Maqolalar",
};

export const TYPE_LABEL_SINGULAR: Record<ContentType, string> = {
  news: "Yangilik",
  guides: "Qo'llanma",
  opinions: "Maqola",
};

export const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: "Boshlang'ich",
  INTERMEDIATE: "O'rta",
  ADVANCED: "Murakkab",
};
