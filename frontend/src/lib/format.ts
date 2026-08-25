import type { ContentType } from "./types";

// Sana formatlash (o'zbekcha)
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
