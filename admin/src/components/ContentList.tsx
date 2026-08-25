"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, buildQuery } from "@/lib/api";
import type { ContentConfig } from "@/lib/contentConfig";
import type { ContentItem, PaginationMeta } from "@/lib/types";
import { formatDateShort } from "@/lib/format";
import Icon from "./Icon";
import { useToast } from "./Toast";

const FILTERS = [
  { value: "", label: "Barchasi" },
  { value: "PUBLISHED", label: "Chop etilgan" },
  { value: "DRAFT", label: "Qoralama" },
];

export default function ContentList({ config }: { config: ContentConfig }) {
  const toast = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Har harfda so'rov yubormaslik uchun qidiruvni kechiktiramiz
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setDebounced(search);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const q = buildQuery({ page, limit: 10, search: debounced, status });
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
  }, [config.apiPath, page, debounced, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function togglePublish(item: ContentItem) {
    const action = item.status === "PUBLISHED" ? "unpublish" : "publish";
    setBusyId(item.id);
    try {
      await api.patch(`${config.apiPath}/${item.id}/${action}`);
      toast.success(
        action === "publish" ? "Chop etildi" : "Saytdan yashirildi"
      );
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: ContentItem) {
    if (!confirm(`"${item.title}" butunlay o'chirilsinmi?`)) return;
    setBusyId(item.id);
    try {
      await api.delete(`${config.apiPath}/${item.id}`);
      toast.success("O'chirildi");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {/* Sarlavha */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="page-title">{config.title}</h2>
          <p className="page-sub">
            {meta ? `Jami ${meta.total} ta yozuv` : "Yuklanmoqda…"}
          </p>
        </div>
        <Link href={`/${config.type}/new`} className="btn-primary">
          <Icon name="plus" className="h-4 w-4" />
          Yangi {config.singular}
        </Link>
      </div>

      {/* Filtrlar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sarlavha bo'yicha qidirish…"
            className="input pl-9"
          />
        </div>

        {/* Segment tugmalari — select'dan tezroq */}
        <div className="inline-flex rounded-lg border border-line bg-paper p-0.5">
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
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Sarlavha</th>
              <th className="w-36">Holat</th>
              <th className="w-24">Izohlar</th>
              <th className="w-32">Sana</th>
              <th className="w-44 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-faint">
                    <Icon name="spinner" className="h-4 w-4 animate-spin" />
                    Yuklanmoqda…
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <Icon name="news" className="h-7 w-7 text-ink-faint" />
                    <p className="text-sm font-medium text-ink">
                      {debounced || status
                        ? "Mos yozuv topilmadi"
                        : `Hali ${config.singular} yo'q`}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {debounced || status
                        ? "Qidiruv yoki filtrni o'zgartiring."
                        : "Birinchi yozuvni qo'shib ko'ring."}
                    </p>
                    {!debounced && !status && (
                      <Link
                        href={`/${config.type}/new`}
                        className="btn-primary btn-sm mt-2"
                      >
                        <Icon name="plus" className="h-4 w-4" />
                        Yangi {config.singular}
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className={busyId === item.id ? "opacity-50" : ""}>
                  <td>
                    <Link
                      href={`/${config.type}/${item.id}`}
                      className="block font-medium text-ink hover:text-brand"
                    >
                      {item.title}
                    </Link>
                    <span className="mt-0.5 block font-mono text-xs text-ink-faint">
                      /{item.slug}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        item.status === "PUBLISHED" ? "pill-ok" : "pill-warn"
                      }
                    >
                      {item.status === "PUBLISHED" ? "Chop etilgan" : "Qoralama"}
                    </span>
                  </td>
                  <td className="text-ink-soft">{item._count?.comments ?? 0}</td>
                  <td className="text-ink-soft">
                    {formatDateShort(item.createdAt)}
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => togglePublish(item)}
                        disabled={busyId === item.id}
                        title={
                          item.status === "PUBLISHED"
                            ? "Saytdan yashirish"
                            : "Saytda chop etish"
                        }
                        className="btn-icon"
                      >
                        <Icon
                          name={item.status === "PUBLISHED" ? "eyeOff" : "eye"}
                          className="h-[18px] w-[18px]"
                        />
                      </button>
                      <Link
                        href={`/${config.type}/${item.id}`}
                        title="Tahrirlash"
                        className="btn-icon"
                      >
                        <Icon name="pencil" className="h-[18px] w-[18px]" />
                      </Link>
                      <button
                        onClick={() => remove(item)}
                        disabled={busyId === item.id}
                        title="O'chirish"
                        className="btn-icon hover:bg-danger-soft hover:text-danger"
                      >
                        <Icon name="trash" className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
