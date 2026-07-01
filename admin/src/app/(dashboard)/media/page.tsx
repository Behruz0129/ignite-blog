"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Media } from "@/lib/types";

export default function MediaPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    try {
      const res = await api.get<Media[]>("/media?limit=100");
      setItems(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yuklashda xatolik");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function remove(id: string) {
    if (!confirm("Rasm o'chirilsinmi?")) return;
    try {
      await api.delete(`/media/${id}`);
      setItems((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Xatolik");
    }
  }

  function copy(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Media kutubxona</h1>
        <label className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          {uploading ? "Yuklanmoqda..." : "+ Rasm yuklash"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={upload}
            disabled={uploading}
          />
        </label>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {items.length === 0 ? (
        <p className="text-slate-500">Hozircha rasm yo'q.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((m) => (
            <div
              key={m.id}
              className="group relative overflow-hidden rounded-xl bg-white shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt="" className="h-32 w-full object-cover" />
              <div className="p-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => copy(m.url)}
                    className="flex-1 rounded bg-slate-100 px-2 py-1 text-xs hover:bg-slate-200"
                  >
                    {copied === m.url ? "Nusxalandi!" : "URL nusxa"}
                  </button>
                  <button
                    onClick={() => remove(m.id)}
                    className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                  >
                    O'chir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
