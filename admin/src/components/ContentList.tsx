"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, buildQuery } from "@/lib/api";
import type { ContentConfig } from "@/lib/contentConfig";
import type { ContentItem, PaginationMeta } from "@/lib/types";

export default function ContentList({ config }: { config: ContentConfig }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const q = buildQuery({ page, limit: 10, search, status });
      const res = await api.get<ContentItem[]>(
        `${config.apiPath}/admin/all${q}`
      );
      setItems(res.data);
      setMeta(res.meta || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, [config.apiPath, page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function togglePublish(item: ContentItem) {
    const action = item.status === "PUBLISHED" ? "unpublish" : "publish";
    try {
      await api.patch(`${config.apiPath}/${item.id}/${action}`);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Xatolik");
    }
  }

  async function remove(item: ContentItem) {
    if (!confirm(`"${item.title}" o'chirilsinmi?`)) return;
    try {
      await api.delete(`${config.apiPath}/${item.id}`);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Xatolik");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
        <Link
          href={`/${config.type}/new`}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          + Yangi {config.singular}
        </Link>
      </div>

      {/* Filtrlar */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Qidirish..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">Barchasi</option>
          <option value="PUBLISHED">Chop etilgan</option>
          <option value="DRAFT">Qoralama</option>
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3">Sarlavha</th>
              <th className="px-5 py-3">Holat</th>
              <th className="px-5 py-3">Izohlar</th>
              <th className="px-5 py-3">Sana</th>
              <th className="px-5 py-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  Hech narsa topilmadi.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-900">
                      {item.title}
                    </div>
                    <div className="font-mono text-xs text-slate-400">
                      /{item.slug}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        item.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.status === "PUBLISHED" ? "Chop etilgan" : "Qoralama"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {item._count?.comments ?? 0}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString("uz")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => togglePublish(item)}
                        className="rounded bg-slate-100 px-2 py-1 text-xs hover:bg-slate-200"
                      >
                        {item.status === "PUBLISHED" ? "Yashirish" : "Chop etish"}
                      </button>
                      <Link
                        href={`/${config.type}/${item.id}`}
                        className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                      >
                        Tahrir
                      </Link>
                      <button
                        onClick={() => remove(item)}
                        className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                      >
                        O'chir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Jami: {meta.total} ta • Sahifa {meta.page}/{meta.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg bg-white px-3 py-1.5 shadow-sm disabled:opacity-40"
            >
              ← Oldingi
            </button>
            <button
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg bg-white px-3 py-1.5 shadow-sm disabled:opacity-40"
            >
              Keyingi →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
