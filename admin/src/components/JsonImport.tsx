"use client";

import { useState } from "react";
import Icon from "./Icon";

/**
 * AI yozib bergan maqolani bitta joydan formaga o'tkazish oynasi.
 *
 * Kategoriya va teglar JSON'da **nom** bilan keladi (AI id larni bilmaydi),
 * shuning uchun ular shu yerda mavjud ro'yxatga solishtiriladi. Topilmagani
 * xato emas — ogohlantirish sifatida ko'rsatiladi va qolgan maydonlar baribir
 * to'ldiriladi: yarim to'ldirilgan forma bo'shidan foydaliroq.
 */

export interface ParsedArticle {
  title?: string;
  excerpt?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  category?: string;
  categories?: string[];
  tags?: string[];
  imagePrompt?: string;
}

export interface ImportResult {
  data: ParsedArticle;
  /** Nomi bo'yicha topilgan kategoriya id lari. */
  categoryIds: string[];
  tagIds: string[];
  /** Foydalanuvchiga ko'rsatiladigan ogohlantirishlar. */
  warnings: string[];
}

interface Props {
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  /** Formada allaqachon matn bor-yo'qligi — ustidan yozishdan ogohlantiramiz. */
  formHasContent: boolean;
  onApply: (result: ImportResult) => void;
  onClose: () => void;
}

/** Nomlarni solishtirishda katta-kichik harf va ortiqcha probel farq qilmasin. */
function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function JsonImport({
  categories,
  tags,
  formHasContent,
  onApply,
  onClose,
}: Props) {
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");

  function handleApply() {
    setError("");

    const text = raw.trim();
    if (!text) {
      setError("JSON matnini qo'ying");
      return;
    }

    let parsed: unknown;
    try {
      // AI ba'zan javobni ```json ... ``` ichiga o'raydi — uni tozalaymiz.
      const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      setError(
        `JSON o'qib bo'lmadi: ${e instanceof Error ? e.message : "noma'lum xato"}`
      );
      return;
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      setError("Kutilgani — obyekt ko'rinishidagi JSON ({ ... })");
      return;
    }

    const data = parsed as ParsedArticle;
    const warnings: string[] = [];

    if (!data.title?.trim()) warnings.push("Sarlavha (title) yo'q");
    if (!data.content?.trim()) warnings.push("Matn (content) yo'q");

    // Kategoriyalar: bitta "category" ham, ro'yxat ham qabul qilinadi.
    const wantedCategories = [
      ...(data.category ? [data.category] : []),
      ...(Array.isArray(data.categories) ? data.categories : []),
    ];
    const categoryIds: string[] = [];
    for (const name of wantedCategories) {
      const found = categories.find((c) => normalize(c.name) === normalize(name));
      if (found) categoryIds.push(found.id);
      else warnings.push(`Kategoriya topilmadi: «${name}»`);
    }

    const tagIds: string[] = [];
    if (Array.isArray(data.tags)) {
      for (const name of data.tags) {
        const found = tags.find((t) => normalize(t.name) === normalize(name));
        if (found) tagIds.push(found.id);
        else warnings.push(`Teg topilmadi: «${name}» (kerak bo'lsa qo'lda qo'shing)`);
      }
    }

    onApply({ data, categoryIds, tagIds, warnings });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-paper shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">JSON&apos;dan to&apos;ldirish</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="ml-auto rounded-lg p-1.5 text-ink-faint transition hover:bg-canvas hover:text-ink"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-[13px] leading-5 text-ink-soft">
            AI yozib bergan JSON&apos;ni shu yerga qo&apos;ying. Sarlavha, qisqacha
            tavsif, matn, SEO maydonlari, kategoriya va teglar formaga
            joylanadi. Kategoriya va teglar <strong>nomi</strong> bo&apos;yicha
            topiladi.
          </p>

          {formHasContent && (
            <div className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[12px] text-ink-soft">
              Formada allaqachon matn bor — to&apos;ldirish uning ustiga yozadi.
            </div>
          )}

          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={'{\n  "title": "...",\n  "excerpt": "...",\n  "content": "<p>...</p>"\n}'}
            spellCheck={false}
            className="mt-3 h-64 w-full rounded-xl border border-line bg-canvas px-3 py-2.5 font-mono text-[12px] leading-5 text-ink outline-none focus:border-line-strong"
          />

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft px-3 py-2.5 text-[13px] text-danger">
              <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-line px-5 py-3">
          <button type="button" onClick={onClose} className="btn-secondary btn-sm">
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="btn-primary btn-sm ml-auto"
          >
            To&apos;ldirish
          </button>
        </div>
      </div>
    </div>
  );
}
