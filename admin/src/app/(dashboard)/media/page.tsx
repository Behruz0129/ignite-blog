"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Media } from "@/lib/types";
import { formatDateShort } from "@/lib/format";
import Icon from "@/components/Icon";
import { useToast } from "@/components/Toast";

function humanSize(bytes?: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const toast = useToast();
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<Media[]>("/media?limit=100");
      setItems(res.data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.upload<Media>("/media/upload", fd);
      setItems((prev) => [res.data, ...prev]);
      toast.success("Rasm yuklandi");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Yuklashda xatolik";
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function remove(m: Media) {
    if (!confirm("Rasm butunlay o'chirilsinmi?")) return;
    try {
      await api.delete(`/media/${m.id}`);
      setItems((prev) => prev.filter((x) => x.id !== m.id));
      toast.success("O'chirildi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    }
  }

  function copy(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="page-title">Media kutubxona</h2>
          <p className="page-sub">{items.length} ta fayl</p>
        </div>

        <label
          className={`btn-primary cursor-pointer ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {uploading ? (
            <Icon name="spinner" className="h-4 w-4 animate-spin" />
          ) : (
            <Icon name="plus" className="h-4 w-4" />
          )}
          {uploading ? "Yuklanmoqda…" : "Rasm yuklash"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={upload}
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-ink-faint">
          <Icon name="spinner" className="h-4 w-4 animate-spin" />
          Yuklanmoqda…
        </div>
      ) : items.length === 0 ? (
        <div className="card empty-state">
          <Icon name="image" className="h-7 w-7 text-ink-faint" />
          <p className="text-sm font-medium text-ink">Kutubxona bo&apos;sh</p>
          <p className="max-w-sm text-sm text-ink-soft">
            Yuklangan rasmlarni maqolaning bosh rasmi sifatida yoki matn ichida
            qayta ishlatish mumkin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((m) => (
            <div key={m.id} className="card group overflow-hidden">
              <div className="relative aspect-[4/3] bg-canvas">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <button
                  onClick={() => remove(m)}
                  title="O'chirish"
                  aria-label="O'chirish"
                  className="absolute right-2 top-2 rounded-lg bg-paper/90 p-1.5 text-ink-soft opacity-0 shadow-card backdrop-blur transition hover:bg-danger hover:text-white group-hover:opacity-100"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>

              <div className="border-t border-line p-2.5">
                <p className="truncate text-xs text-ink-faint">
                  {m.width && m.height ? `${m.width}×${m.height}` : m.format}
                  {m.bytes ? ` · ${humanSize(m.bytes)}` : ""}
                </p>
                <button
                  onClick={() => copy(m.url)}
                  className="btn-secondary btn-sm mt-2 w-full"
                >
                  {copied === m.url ? (
                    <>
                      <Icon name="check" className="h-4 w-4 text-ok" />
                      Nusxalandi
                    </>
                  ) : (
                    "URL nusxalash"
                  )}
                </button>
                {m.createdAt && (
                  <p className="mt-1.5 text-center text-[11px] text-ink-faint">
                    {formatDateShort(m.createdAt)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
