"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { ContentConfig } from "@/lib/contentConfig";
import type { ContentItem, Taxonomy } from "@/lib/types";
import Editor from "./Editor";
import MediaPicker from "./MediaPicker";
import Icon from "./Icon";
import { useToast } from "./Toast";

interface ContentFormProps {
  config: ContentConfig;
  id?: string; // berilsa - tahrirlash, bo'lmasa - yangi
}

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  metaTitle: string;
  metaDescription: string;
  status: "DRAFT" | "PUBLISHED";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  categoryIds: string[];
  tagIds: string[];
}

const EMPTY: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  metaTitle: "",
  metaDescription: "",
  status: "DRAFT",
  difficulty: "BEGINNER",
  categoryIds: [],
  tagIds: [],
};

// Backend'dagi slugify bilan bir xil mantiq — foydalanuvchi natijani
// oldindan ko'rib tursin
function previewSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const SEO_TITLE_MAX = 60;
const SEO_DESC_MAX = 160;

export default function ContentForm({ config, id }: ContentFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<Taxonomy[]>([]);
  const [tags, setTags] = useState<Taxonomy[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [picker, setPicker] = useState<null | "featured" | "editor">(null);
  const [seoOpen, setSeoOpen] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Sarlavha maydoni matnga qarab o'sadi. Yozganda ham, yozuv bazadan
  // yuklanganda ham balandlikni qayta hisoblash kerak — aks holda uzun
  // sarlavha bir qatorga siqilib, ko'rinmay qoladi.
  function autoGrow(el: HTMLTextAreaElement | null) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(() => {
    api.get<Taxonomy[]>("/categories").then((r) => setCategories(r.data));
    api.get<Taxonomy[]>("/tags").then((r) => setTags(r.data));

    if (id) {
      api
        .get<ContentItem>(`${config.apiPath}/admin/${id}`)
        .then((r) => {
          const d = r.data;
          setForm({
            title: d.title,
            slug: d.slug,
            excerpt: d.excerpt || "",
            content: d.content || "",
            featuredImage: d.featuredImage || "",
            metaTitle: d.metaTitle || "",
            metaDescription: d.metaDescription || "",
            status: d.status,
            difficulty: d.difficulty || "BEGINNER",
            categoryIds: d.categories?.map((c) => c.id) || [],
            tagIds: d.tags?.map((t) => t.id) || [],
          });
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoadingItem(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    autoGrow(titleRef.current);
  }, [form.title]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArray(key: "categoryIds" | "tagIds", value: string) {
    setForm((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((x) => x !== value)
          : [...arr, value],
      };
    });
  }

  const effectiveSlug = form.slug || previewSlug(form.title);
  const canSave = Boolean(form.title.trim());

  // Yon ustunda "nima to'ldirilmagan" ko'rsatkichi
  const checklist = useMemo(
    () => [
      { ok: Boolean(form.title.trim()), text: "Sarlavha" },
      { ok: Boolean(form.content.replace(/<[^>]*>/g, "").trim()), text: "Matn" },
      { ok: Boolean(form.excerpt.trim()), text: "Qisqacha tavsif" },
      { ok: Boolean(form.featuredImage), text: "Bosh rasm" },
      { ok: form.categoryIds.length > 0, text: "Kategoriya" },
    ],
    [form]
  );

  async function submit(status: "DRAFT" | "PUBLISHED") {
    setError("");
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt || undefined,
        content: form.content,
        featuredImage: form.featuredImage || undefined,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        status,
        categoryIds: form.categoryIds,
        tagIds: form.tagIds,
      };
      if (config.hasDifficulty) payload.difficulty = form.difficulty;

      if (id) {
        await api.put(`${config.apiPath}/${id}`, payload);
      } else {
        await api.post(config.apiPath, payload);
      }

      toast.success(
        status === "PUBLISHED"
          ? `${config.singular} chop etildi`
          : "Qoralama saqlandi"
      );
      router.push(`/${config.type}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Saqlashda xatolik";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (loadingItem) {
    return (
      <div className="flex items-center gap-2 py-20 text-sm text-ink-faint">
        <Icon name="spinner" className="h-4 w-4 animate-spin" />
        Yuklanmoqda…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Amallar paneli — sahifa aylanganda ham ko'rinib turadi */}
      <div className="sticky top-16 z-10 -mx-4 mb-5 flex flex-wrap items-center gap-3 border-b border-line bg-canvas/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <button
          onClick={() => router.push(`/${config.type}`)}
          className="btn-ghost btn-sm"
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
          {config.title}
        </button>

        <span className="hidden text-sm text-ink-faint sm:inline">/</span>
        <span className="hidden truncate text-sm font-medium text-ink sm:inline">
          {form.title || `Yangi ${config.singular}`}
        </span>

        <span
          className={form.status === "PUBLISHED" ? "pill-ok" : "pill-warn"}
        >
          {form.status === "PUBLISHED" ? "Chop etilgan" : "Qoralama"}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => submit("DRAFT")}
            disabled={loading || !canSave}
            className="btn-secondary btn-sm"
          >
            Qoralama saqlash
          </button>
          <button
            onClick={() => submit("PUBLISHED")}
            disabled={loading || !canSave}
            className="btn-primary btn-sm"
          >
            {loading && <Icon name="spinner" className="h-4 w-4 animate-spin" />}
            Chop etish
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* ---------------------------------------------- asosiy ustun */}
        <div className="min-w-0 space-y-5">
          {/* Sarlavha — hujjatning o'zi kabi, ramkasiz */}
          <div className="card card-pad">
            <textarea
              ref={titleRef}
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              rows={1}
              placeholder={`${config.singular} sarlavhasi`}
              className="w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink outline-none placeholder:text-ink-faint/60"
              onInput={(e) => autoGrow(e.currentTarget)}
            />

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[13px]">
              <span className="text-ink-faint">Manzil:</span>
              <span className="font-mono text-ink-soft">/{config.type}/</span>
              <input
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder={previewSlug(form.title) || "avtomatik"}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[13px] text-ink outline-none placeholder:text-ink-faint"
              />
              {!form.slug && form.title && (
                <span className="pill-muted">sarlavhadan olinadi</span>
              )}
            </div>
          </div>

          {/* Matn */}
          <Editor
            value={form.content}
            onChange={(html) => update("content", html)}
            onPickImage={() => setPicker("editor")}
          />

          {/* Qisqacha tavsif */}
          <div className="card card-pad">
            <label className="field-label">Qisqacha tavsif</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              rows={2}
              className="input resize-none"
              placeholder="Ro'yxatlarda va qidiruvda ko'rinadigan bir-ikki gap"
            />
            <p className="field-hint">
              Bo'sh qolsa ro'yxatlarda faqat sarlavha ko'rinadi.
            </p>
          </div>

          {/* SEO — kamdan-kam ochiladi, shuning uchun yig'ilgan */}
          <div className="card">
            <button
              type="button"
              onClick={() => setSeoOpen((v) => !v)}
              className="flex w-full items-center gap-2 px-5 py-4 text-left"
            >
              <span className="card-title">SEO</span>
              <span className="text-xs text-ink-faint">
                {form.metaTitle || form.metaDescription
                  ? "to'ldirilgan"
                  : "sarlavha va tavsifdan olinadi"}
              </span>
              <Icon
                name="chevronDown"
                className={`ml-auto h-4 w-4 text-ink-faint transition ${
                  seoOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {seoOpen && (
              <div className="border-t border-line px-5 py-4">
                <label className="field-label">Meta title</label>
                <input
                  value={form.metaTitle}
                  onChange={(e) => update("metaTitle", e.target.value)}
                  className="input"
                  placeholder={form.title || "Sahifa sarlavhasi"}
                />
                <p className="field-hint">
                  {form.metaTitle.length}/{SEO_TITLE_MAX} belgi
                  {form.metaTitle.length > SEO_TITLE_MAX &&
                    " — qidiruvda kesilishi mumkin"}
                </p>

                <label className="field-label mt-4">Meta description</label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => update("metaDescription", e.target.value)}
                  rows={2}
                  className="input resize-none"
                  placeholder={form.excerpt || "Qisqacha tavsif"}
                />
                <p className="field-hint">
                  {form.metaDescription.length}/{SEO_DESC_MAX} belgi
                  {form.metaDescription.length > SEO_DESC_MAX &&
                    " — qidiruvda kesilishi mumkin"}
                </p>

                <p className="field-hint mt-3">
                  Ijtimoiy tarmoqda ulashilganda bosh rasm (featured image)
                  ko'rsatiladi.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ---------------------------------------------- yon ustun */}
        <div className="space-y-5">
          {/* Tayyorlik */}
          <div className="card card-pad">
            <h3 className="card-title mb-3">Tayyorlik</h3>
            <ul className="space-y-2">
              {checklist.map((c) => (
                <li key={c.text} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                      c.ok ? "bg-ok-soft text-ok" : "bg-canvas text-ink-faint"
                    }`}
                  >
                    {c.ok ? (
                      <Icon name="check" className="h-3 w-3" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <span className={c.ok ? "text-ink" : "text-ink-soft"}>
                    {c.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bosh rasm */}
          <div className="card card-pad">
            <h3 className="card-title mb-3">Bosh rasm</h3>
            {form.featuredImage ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.featuredImage}
                  alt=""
                  className="aspect-[16/9] w-full rounded-lg border border-line object-cover"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setPicker("featured")}
                    className="btn-secondary btn-sm flex-1"
                  >
                    Almashtirish
                  </button>
                  <button
                    onClick={() => update("featuredImage", "")}
                    className="btn-ghost btn-sm text-danger hover:bg-danger-soft"
                    aria-label="Rasmni olib tashlash"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setPicker("featured")}
                className="flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed border-line-strong py-8 text-sm text-ink-soft transition hover:border-brand hover:bg-brand-soft/40 hover:text-brand"
              >
                <Icon name="image" className="h-5 w-5" />
                Rasm tanlash
              </button>
            )}
          </div>

          {/* Murakkablik (faqat qo'llanmada) */}
          {config.hasDifficulty && (
            <div className="card card-pad">
              <h3 className="card-title mb-3">Murakkablik</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    ["BEGINNER", "Boshlang'ich"],
                    ["INTERMEDIATE", "O'rta"],
                    ["ADVANCED", "Murakkab"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => update("difficulty", val)}
                    className={`rounded-lg border px-2 py-2 text-[12.5px] font-medium transition ${
                      form.difficulty === val
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Kategoriyalar */}
          <div className="card card-pad">
            <h3 className="card-title mb-3">
              Kategoriyalar
              {form.categoryIds.length > 0 && (
                <span className="ml-1.5 font-normal normal-case tracking-normal text-brand">
                  {form.categoryIds.length} ta
                </span>
              )}
            </h3>
            {categories.length === 0 ? (
              <p className="text-xs text-ink-faint">Avval kategoriya qo&apos;shing.</p>
            ) : (
              <div className="max-h-52 space-y-0.5 overflow-y-auto">
                {categories.map((c) => {
                  const on = form.categoryIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition ${
                        on ? "bg-brand-soft text-brand" : "hover:bg-canvas"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleArray("categoryIds", c.id)}
                        className="h-4 w-4 shrink-0 accent-brand"
                      />
                      <span className="truncate">{c.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Teglar */}
          <div className="card card-pad">
            <h3 className="card-title mb-3">
              Teglar
              {form.tagIds.length > 0 && (
                <span className="ml-1.5 font-normal normal-case tracking-normal text-brand">
                  {form.tagIds.length} ta
                </span>
              )}
            </h3>
            {tags.length === 0 ? (
              <p className="text-xs text-ink-faint">Avval teg qo&apos;shing.</p>
            ) : (
              <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
                {tags.map((t) => {
                  const on = form.tagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleArray("tagIds", t.id)}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                        on
                          ? "border-brand-line bg-brand-soft text-brand"
                          : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Manzil ko'rinishi */}
          {effectiveSlug && (
            <div className="card card-pad">
              <h3 className="card-title mb-2">Sahifa manzili</h3>
              <p className="break-all font-mono text-[12.5px] text-ink-soft">
                /{config.type}/{effectiveSlug}
              </p>
            </div>
          )}
        </div>
      </div>

      <MediaPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        onSelect={(url) => {
          if (picker === "featured") {
            update("featuredImage", url);
          } else if (picker === "editor") {
            const fn = (
              window as unknown as { __insertImage?: (u: string) => void }
            ).__insertImage;
            fn?.(url);
          }
        }}
      />
    </div>
  );
}
