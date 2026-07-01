"use client";

import { useCallback, useEffect, useState } from "react";
import { api, buildQuery } from "@/lib/api";
import type { Comment, PaginationMeta } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Kutilmoqda",
  APPROVED: "Tasdiqlangan",
  REJECTED: "Rad etilgan",
};

export default function CommentsPage() {
  const [items, setItems] = useState<Comment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const q = buildQuery({ page, limit: 15, status });
      const res = await api.get<Comment[]>(`/comments${q}`);
      setItems(res.data);
      setMeta(res.meta || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "approve" | "reject") {
    try {
      await api.patch(`/comments/${id}/${action}`);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Xatolik");
    }
  }

  async function remove(id: string) {
    if (!confirm("Izoh o'chirilsinmi?")) return;
    try {
      await api.delete(`/comments/${id}`);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Xatolik");
    }
  }

  function targetTitle(c: Comment) {
    return c.news?.title || c.guide?.title || c.opinion?.title || "—";
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Izohlar</h1>

      <div className="mb-4">
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">Barchasi</option>
          <option value="PENDING">Kutilmoqda</option>
          <option value="APPROVED">Tasdiqlangan</option>
          <option value="REJECTED">Rad etilgan</option>
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-slate-500">Izoh yo'q.</p>
        ) : (
          items.map((c) => (
            <div key={c.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">
                      {c.authorName}
                    </span>
                    <span className="text-xs text-slate-400">
                      {c.authorEmail}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        c.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : c.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {STATUS_LABEL[c.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-700">{c.content}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {targetTitle(c)} •{" "}
                    {new Date(c.createdAt).toLocaleString("uz")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {c.status !== "APPROVED" && (
                    <button
                      onClick={() => act(c.id, "approve")}
                      className="rounded bg-green-50 px-3 py-1 text-xs text-green-600 hover:bg-green-100"
                    >
                      Tasdiqlash
                    </button>
                  )}
                  {c.status !== "REJECTED" && (
                    <button
                      onClick={() => act(c.id, "reject")}
                      className="rounded bg-amber-50 px-3 py-1 text-xs text-amber-700 hover:bg-amber-100"
                    >
                      Rad etish
                    </button>
                  )}
                  <button
                    onClick={() => remove(c.id)}
                    className="rounded bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100"
                  >
                    O'chir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Jami: {meta.total} • Sahifa {meta.page}/{meta.totalPages}
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
