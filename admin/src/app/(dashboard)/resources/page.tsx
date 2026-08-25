"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Icon from "@/components/Icon";
import MediaPicker from "@/components/MediaPicker";
import { useToast } from "@/components/Toast";

/**
 * Foydali resurslar bo'limi.
 *
 * Maqolalardan farqli: bu yerda matn tahrirlash yo'q, shuning uchun alohida
 * sahifa emas — ro'yxat va qo'shish formasi bir joyda turadi.
 */

interface Resource {
  id: string;
  title: string;
  description?: string | null;
  url: string;
  image?: string | null;
  group?: string | null;
  status: "DRAFT" | "PUBLISHED";
  order: number;
}

interface FormState {
  id?: string;
  title: string;
  url: string;
  description: string;
  image: string;
  group: string;
  order: number;
  status: "DRAFT" | "PUBLISHED";
}

const EMPTY: FormState = {
  title: "",
  url: "",
  description: "",
  image: "",
  group: "",
  order: 0,
  status: "PUBLISHED",
};

export default function ResourcesPage() {
  const toast = useToast();
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<Resource[]>("/resources/admin/all");
      setItems(res.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        url: form.url,
        description: form.description || null,
        image: form.image || null,
        group: form.group || null,
        order: Number(form.order) || 0,
        status: form.status,
      };

      if (form.id) {
        await api.put(`/resources/${form.id}`, payload);
        toast.success("Saqlandi");
      } else {
        await api.post("/resources", payload);
        toast.success("Resurs qo'shildi");
      }

      setForm(EMPTY);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Resource) {
    if (!confirm(`"${item.title}" o'chirilsinmi?`)) return;
    try {
      await api.delete(`/resources/${item.id}`);
      toast.success("O'chirildi");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "O'chirishda xatolik");
    }
  }

  // Mavjud guruhlar — yangi resurs qo'shayotganda tanlash uchun maslahat
  const groups = [...new Set(items.map((i) => i.group).filter(Boolean))] as string[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-ink">Resurslar</h1>
        <span className="text-sm text-ink-faint">{items.length} ta</span>
      </div>

      {/* Qo'shish / tahrirlash formasi */}
      <form onSubmit={submit} className="card card-pad space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="card-title">
            {form.id ? "Resursni tahrirlash" : "Yangi resurs"}
          </h2>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(EMPTY)}
              className="ml-auto text-[12px] text-ink-faint underline"
            >
              Bekor qilish
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[12px] text-ink-soft">Nom *</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Masalan: SteamDB"
              className="input"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[12px] text-ink-soft">Havola *</span>
            <input
              required
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
              className="input"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-[12px] text-ink-soft">
            Tavsif — nima uchun foydali
          </span>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="input resize-y"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[12px] text-ink-soft">Guruh</span>
            <input
              list="resource-groups"
              value={form.group}
              onChange={(e) => setForm({ ...form, group: e.target.value })}
              placeholder="Asboblar"
              className="input"
            />
            <datalist id="resource-groups">
              {groups.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <span className="mb-1 block text-[12px] text-ink-soft">
              Tartib (kichik — yuqorida)
            </span>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="input"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[12px] text-ink-soft">Holat</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as "DRAFT" | "PUBLISHED" })
              }
              className="input"
            >
              <option value="PUBLISHED">Ko&apos;rinadi</option>
              <option value="DRAFT">Yashirin</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="btn-secondary btn-sm"
          >
            <Icon name="image" className="h-4 w-4" />
            {form.image ? "Rasmni almashtirish" : "Rasm tanlash"}
          </button>

          {form.image && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.image}
                alt=""
                className="h-9 w-9 rounded-lg border border-line object-cover"
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, image: "" })}
                className="text-[12px] text-ink-faint underline"
              >
                Olib tashlash
              </button>
            </>
          )}

          <button type="submit" disabled={saving} className="btn-primary btn-sm ml-auto">
            {saving && <Icon name="spinner" className="h-4 w-4 animate-spin" />}
            {form.id ? "Saqlash" : "Qo'shish"}
          </button>
        </div>
      </form>

      {/* Ro'yxat */}
      {loading ? (
        <div className="card card-pad text-sm text-ink-faint">Yuklanmoqda…</div>
      ) : items.length === 0 ? (
        <div className="card card-pad text-sm text-ink-faint">
          Hozircha resurs yo&apos;q. Yuqoridagi formadan qo&apos;shing.
        </div>
      ) : (
        <div className="card divide-y divide-line">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-canvas">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-ink-faint">{item.title.charAt(0)}</span>
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-medium text-ink">{item.title}</span>
                  {item.status === "DRAFT" && (
                    <span className="pill-warn text-[11px]">Yashirin</span>
                  )}
                  {item.group && (
                    <span className="text-[11px] text-ink-faint">{item.group}</span>
                  )}
                </span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 block truncate text-[12px] text-ink-faint underline-offset-2 hover:underline"
                >
                  {item.url}
                </a>
              </span>

              <button
                type="button"
                onClick={() =>
                  setForm({
                    id: item.id,
                    title: item.title,
                    url: item.url,
                    description: item.description ?? "",
                    image: item.image ?? "",
                    group: item.group ?? "",
                    order: item.order,
                    status: item.status,
                  })
                }
                className="rounded-lg p-2 text-ink-faint transition hover:bg-canvas hover:text-ink"
                aria-label="Tahrirlash"
              >
                <Icon name="pencil" className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => remove(item)}
                className="rounded-lg p-2 text-ink-faint transition hover:bg-danger-soft hover:text-danger"
                aria-label="O'chirish"
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {pickerOpen && (
        <MediaPicker
          open
          onSelect={(url) => {
            setForm((f) => ({ ...f, image: url }));
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
