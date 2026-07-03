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

// HTML'dan taxminiy o'qish vaqti (daqiqa)
export function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
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
