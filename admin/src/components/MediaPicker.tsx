"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Media } from "@/lib/types";

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  // Rasm tanlanganda URL qaytaradi
  onSelect: (url: string) => void;
}

export default function MediaPicker({ open, onClose, onSelect }: MediaPickerProps) {
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

  async function handleDelete(id: string) {
    if (!confirm("Ushbu rasmni o'chirmoqchimisiz?")) return;
    try {
      await api.delete(`/media/${id}`);
      setItems((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "O'chirishda xatolik");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold">Media kutubxona</h3>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark">
              {uploading ? "Yuklanmoqda..." : "+ Rasm yuklash"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200"
            >
              Yopish
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          {loading ? (
            <p className="text-slate-500">Yuklanmoqda...</p>
          ) : items.length === 0 ? (
            <p className="text-slate-500">Hozircha rasm yo'q. Yuklang.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((m) => (
                <div
                  key={m.id}
                  className="group relative overflow-hidden rounded-lg border border-slate-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.url}
                    alt=""
                    className="h-28 w-full cursor-pointer object-cover"
                    onClick={() => {
                      onSelect(m.url);
                      onClose();
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/60 p-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(m.url);
                      }}
                      className="flex-1 rounded bg-white/90 px-1 py-0.5 text-xs"
                      title="URL nusxalash"
                    >
                      Nusxa
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="flex-1 rounded bg-red-500 px-1 py-0.5 text-xs text-white"
                    >
                      O'chir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
