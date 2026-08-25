"use client";

import { useCallback, useEffect, useState } from "react";
import { api, buildQuery } from "@/lib/api";
import type { Comment, PaginationMeta } from "@/lib/types";
import { commentAuthor, commentEmail, formatDateTime, initial } from "@/lib/format";
import Icon from "@/components/Icon";
import { useToast } from "@/components/Toast";

const FILTERS = [
  { value: "", label: "Barchasi" },
  { value: "PENDING", label: "Kutmoqda" },
  { value: "APPROVED", label: "Tasdiqlangan" },
  { value: "REJECTED", label: "Rad etilgan" },
];

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Kutmoqda",
  APPROVED: "Tasdiqlangan",
  REJECTED: "Rad etilgan",
};

function statusClass(status: string) {
  if (status === "APPROVED") return "pill-ok";
  if (status === "REJECTED") return "pill-danger";
  return "pill-warn";
}

export default function CommentsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Comment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const q = buildQuery({ page, limit: 15, status });
      const res = await api.get<Comment[]>(`/comments${q}`);
      setItems(res.data);
      setMeta(res.meta || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      await api.patch(`/comments/${id}/${action}`);
      toast.success(action === "approve" ? "Tasdiqlandi" : "Rad etildi");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Izoh butunlay o'chirilsinmi?")) return;
    setBusyId(id);
    try {
      await api.delete(`/comments/${id}`);
      toast.success("O'chirildi");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusyId(null);
    }
  }

  /** Izoh qaysi maqolaga tegishli — turiga qarab ikonka tanlanadi. */
  function target(c: Comment) {
    if (!c.post) return null;
    const icon =
      c.post.type === "GUIDE" ? "guide" : c.post.type === "OPINION" ? "opinion" : "news";
    return { label: c.post.title, icon: icon as "news" | "guide" | "opinion" };
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="page-title">Izohlar</h2>
        <p className="page-sub">
          {meta ? `Jami ${meta.total} ta izoh` : "Yuklanmoqda…"}
        </p>
      </div>

      {/* Filtr */}
      <div className="mb-4 inline-flex flex-wrap rounded-lg border border-line bg-paper p-0.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setPage(1);
              setStatus(f.value);
            }}
            className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition ${
              status === f.value
                ? "bg-brand-soft text-brand"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
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
          <Icon name="comment" className="h-7 w-7 text-ink-faint" />
          <p className="text-sm font-medium text-ink">Izoh yo&apos;q</p>
          <p className="text-sm text-ink-soft">
            {status
              ? "Bu holatda izoh topilmadi."
              : "O'quvchilar izoh qoldirganda shu yerda ko'rinadi."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((c) => {
            const name = commentAuthor(c);
            const email = commentEmail(c);
            const t = target(c);
            const busy = busyId === c.id;

            return (
              <div
                key={c.id}
                className={`card card-pad transition ${busy ? "opacity-50" : ""}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-sm font-semibold text-ink-soft">
                    {initial(name)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-ink">{name}</span>
                      {email && (
                        <span className="text-xs text-ink-faint">{email}</span>
                      )}
                      {!c.user && <span className="pill-muted">mehmon</span>}
                      <span className={statusClass(c.status)}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </div>

                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">
                      {c.content}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-faint">
                      {t && (
                        <span className="inline-flex items-center gap-1.5">
                          <Icon name={t.icon} className="h-3.5 w-3.5" />
                          <span className="max-w-[22rem] truncate">{t.label}</span>
                        </span>
                      )}
                      <span>·</span>
                      <span>{formatDateTime(c.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {c.status !== "APPROVED" && (
                      <button
                        onClick={() => act(c.id, "approve")}
                        disabled={busy}
                        className="btn-secondary btn-sm text-ok"
                      >
                        <Icon name="check" className="h-4 w-4" />
                        Tasdiqlash
                      </button>
                    )}
                    {c.status !== "REJECTED" && (
                      <button
                        onClick={() => act(c.id, "reject")}
                        disabled={busy}
                        className="btn-secondary btn-sm text-warn"
                      >
                        <Icon name="close" className="h-4 w-4" />
                        Rad etish
                      </button>
                    )}
                    <button
                      onClick={() => remove(c.id)}
                      disabled={busy}
                      title="O'chirish"
                      className="btn-icon hover:bg-danger-soft hover:text-danger"
                    >
                      <Icon name="trash" className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span className="text-ink-soft">
            Sahifa {meta.page} / {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary btn-sm"
            >
              <Icon name="chevronLeft" className="h-4 w-4" />
              Oldingi
            </button>
            <button
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary btn-sm"
            >
              Keyingi
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
