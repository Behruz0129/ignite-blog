"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { ContentConfig } from "@/lib/contentConfig";
import type { ContentItem, Taxonomy } from "@/lib/types";
import Editor from "./Editor";
import MediaPicker from "./MediaPicker";

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

export default function ContentForm({ config, id }: ContentFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<Taxonomy[]>([]);
  const [tags, setTags] = useState<Taxonomy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // "featured" - bosh rasm tanlash, "editor" - matn ichiga rasm qo'shish
  const [picker, setPicker] = useState<null | "featured" | "editor">(null);

  // Kategoriya/teg ro'yxatlarini va (tahrir bo'lsa) mavjud yozuvni yuklash
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
        .catch((e) => setError(e.message));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  async function submit(status?: "DRAFT" | "PUBLISHED") {
    setError("");
    setLoading(true);
    try {
      // Bo'sh ixtiyoriy maydonlarni undefined qilamiz (validatsiya uchun)
      const payload: Record<string, unknown> = {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt || undefined,
        content: form.content,
        featuredImage: form.featuredImage || undefined,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        status: status ?? form.status,
        categoryIds: form.categoryIds,
        tagIds: form.tagIds,
      };
      if (config.hasDifficulty) payload.difficulty = form.difficulty;

      if (id) {
        await api.put(`${config.apiPath}/${id}`, payload);
      } else {
        await api.post(config.apiPath, payload);
      }
      router.push(`/${config.type}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saqlashda xatolik");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          {id ? `${config.singular} tahrirlash` : `Yangi ${config.singular}`}
        </h1>
        <button
          onClick={() => router.push(`/${config.type}`)}
          className="rounded-lg bg-slate-200 px-4 py-2 text-sm hover:bg-slate-300"
        >
          ← Orqaga
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Asosiy ustun */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <label className="mb-1 block text-sm font-medium">Sarlavha *</label>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
              placeholder="Sarlavhani kiriting"
            />

            <label className="mb-1 mt-4 block text-sm font-medium">
              Slug (ixtiyoriy — bo'sh qolsa sarlavhadan yasaladi)
            </label>
            <input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-brand"
              placeholder="masalan: yangi-oyin-chiqdi"
            />

            <label className="mb-1 mt-4 block text-sm font-medium">
              Qisqacha tavsif (excerpt)
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
            />
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <label className="mb-2 block text-sm font-medium">Kontent *</label>
            <Editor
              value={form.content}
              onChange={(html) => update("content", html)}
              onPickImage={() => setPicker("editor")}
            />
          </div>

          {/* SEO */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-900">SEO</h3>
            <label className="mb-1 block text-sm font-medium">Meta Title</label>
            <input
              value={form.metaTitle}
              onChange={(e) => update("metaTitle", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
            />
            <label className="mb-1 mt-3 block text-sm font-medium">
              Meta Description
            </label>
            <textarea
              value={form.metaDescription}
              onChange={(e) => update("metaDescription", e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
            />
            <p className="mt-2 text-xs text-slate-400">
              Open Graph rasmi sifatida bosh rasm (featured image) ishlatiladi.
            </p>
          </div>
        </div>

        {/* Yon ustun */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-900">Nashr</h3>
            <label className="mb-1 block text-sm font-medium">Holat</label>
            <select
              value={form.status}
              onChange={(e) =>
                update("status", e.target.value as FormState["status"])
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
            >
              <option value="DRAFT">Qoralama</option>
              <option value="PUBLISHED">Chop etilgan</option>
            </select>

            {config.hasDifficulty && (
              <>
                <label className="mb-1 mt-3 block text-sm font-medium">
                  Murakkablik
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    update(
                      "difficulty",
                      e.target.value as FormState["difficulty"]
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
                >
                  <option value="BEGINNER">Boshlang'ich</option>
                  <option value="INTERMEDIATE">O'rta</option>
                  <option value="ADVANCED">Murakkab</option>
                </select>
              </>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => submit("DRAFT")}
                disabled={loading || !form.title}
                className="flex-1 rounded-lg bg-slate-200 py-2 text-sm font-medium hover:bg-slate-300 disabled:opacity-50"
              >
                Qoralama
              </button>
              <button
                onClick={() => submit("PUBLISHED")}
                disabled={loading || !form.title}
                className="flex-1 rounded-lg bg-brand py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
              >
                {loading ? "..." : "Chop etish"}
              </button>
            </div>
          </div>

          {/* Bosh rasm */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-900">Bosh rasm</h3>
            {form.featuredImage ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.featuredImage}
                  alt=""
                  className="w-full rounded-lg object-cover"
                />
                <button
                  onClick={() => update("featuredImage", "")}
                  className="w-full rounded-lg bg-red-50 py-1.5 text-sm text-red-600 hover:bg-red-100"
                >
                  O'chirish
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPicker("featured")}
                className="w-full rounded-lg border-2 border-dashed border-slate-300 py-6 text-sm text-slate-500 hover:border-brand"
              >
                + Rasm tanlash
              </button>
            )}
          </div>

          {/* Kategoriyalar */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-900">Kategoriyalar</h3>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.categoryIds.includes(c.id)}
                    onChange={() => toggleArray("categoryIds", c.id)}
                  />
                  {c.name}
                </label>
              ))}
              {categories.length === 0 && (
                <p className="text-xs text-slate-400">Avval kategoriya qo'shing.</p>
              )}
            </div>
          </div>

          {/* Teglar */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-900">Teglar</h3>
            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
              {tags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleArray("tagIds", t.id)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    form.tagIds.includes(t.id)
                      ? "bg-brand text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {t.name}
                </button>
              ))}
              {tags.length === 0 && (
                <p className="text-xs text-slate-400">Avval teg qo'shing.</p>
              )}
            </div>
          </div>
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
