"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Media } from "@/lib/types";
import Icon from "./Icon";

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  /** Rasm tanlanganda URL qaytaradi */
  onSelect: (url: string) => void;
}

export default function MediaPicker({
  open,
  onClose,
  onSelect,
}: MediaPickerProps) {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<Media[]>("/media?limit=100");
      setItems(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  // Esc bilan yopish
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.upload<Media>("/media/upload", fd);
      setItems((prev) => [res.data, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yuklashda xatolik");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-4xl animate-pop-in flex-col overflow-hidden rounded-2xl bg-paper shadow-pop"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Media kutubxona"
      >
        {/* Bosh qismi */}
        <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
          <h3 className="text-[15px] font-semibold text-ink">Media kutubxona</h3>
          <span className="text-xs text-ink-faint">{items.length} ta fayl</span>

          <div className="ml-auto flex items-center gap-2">
            <label
              className={`btn-secondary btn-sm cursor-pointer ${
                uploading ? "pointer-events-none opacity-60" : ""
              }`}
            >
              {uploading ? (
                <Icon name="spinner" className="h-4 w-4 animate-spin" />
              ) : (
                <Icon name="plus" className="h-4 w-4" />
              )}
              {uploading ? "Yuklanmoqda…" : "Yuklash"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            <button onClick={onClose} aria-label="Yopish" className="btn-icon">
              <Icon name="close" />
            </button>
          </div>
        </div>

        {/* Ro'yxat */}
        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
              <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-faint">
              <Icon name="spinner" className="h-4 w-4 animate-spin" />
              Yuklanmoqda…
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <Icon name="image" className="h-7 w-7 text-ink-faint" />
              <p className="text-sm font-medium text-ink">Kutubxona bo&apos;sh</p>
              <p className="text-sm text-ink-soft">
                Yuqoridagi &laquo;Yuklash&raquo; orqali birinchi rasmni qo&apos;shing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSelect(m.url);
                    onClose();
                  }}
                  className="group overflow-hidden rounded-xl border border-line transition hover:border-brand hover:shadow-pop"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.url}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <span className="flex items-center justify-center gap-1.5 bg-paper py-2 text-xs font-medium text-ink-soft transition group-hover:text-brand">
                    <Icon name="check" className="h-3.5 w-3.5" />
                    Tanlash
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
