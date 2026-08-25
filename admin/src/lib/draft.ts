"use client";

import type { ContentType } from "./contentConfig";

/**
 * Yozilayotgan maqolaning brauzerdagi zaxira nusxasi.
 *
 * Bu serverdagi DRAFT statusi bilan bir narsa emas: bu yerda gap tasodifan
 * yopilgan oyna, uzilgan internet yoki yangilanib ketgan sahifa haqida —
 * shunday holatda ham yozilgan matn yo'qolmasligi kerak. Server holati
 * yagona haqiqat bo'lib qoladi, localStorage faqat tiklash uchun.
 */

const PREFIX = "ignite.draft";
/** Bir haftadan eski zaxira nusxalar tiklanmaydi. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface DraftPayload<T> {
  savedAt: number;
  data: T;
}

function key(type: ContentType, id?: string) {
  return `${PREFIX}.${type}.${id ?? "new"}`;
}

export function saveDraft<T>(type: ContentType, id: string | undefined, data: T) {
  try {
    const payload: DraftPayload<T> = { savedAt: Date.now(), data };
    localStorage.setItem(key(type, id), JSON.stringify(payload));
  } catch {
    // Xotira to'lgan yoki shaxsiy rejim — zaxira yo'q, lekin yozishga xalaqit bermaymiz.
  }
}

export function readDraft<T>(type: ContentType, id?: string): DraftPayload<T> | null {
  try {
    const raw = localStorage.getItem(key(type, id));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as DraftPayload<T>;
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(key(type, id));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearDraft(type: ContentType, id?: string) {
  try {
    localStorage.removeItem(key(type, id));
  } catch {
    // e'tiborsiz
  }
}

/** "2 daqiqa oldin" ko'rinishidagi qisqa vaqt yozuvi. */
export function savedAgo(savedAt: number): string {
  const seconds = Math.round((Date.now() - savedAt) / 1000);
  if (seconds < 60) return "hozirgina";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.round(hours / 24)} kun oldin`;
}
