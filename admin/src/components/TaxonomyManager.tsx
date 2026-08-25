"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Taxonomy } from "@/lib/types";
import Icon from "./Icon";
import { useToast } from "./Toast";

interface Props {
  apiPath: string; // "/categories" yoki "/tags"
  title: string;
  /** Bo'sh holatdagi tushuntirish */
  hint: string;
}

export default function TaxonomyManager({ apiPath, title, hint }: Props) {
  const toast = useToast();
  const [items, setItems] = useState<Taxonomy[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<Taxonomy[]>(apiPath);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post(apiPath, { name: name.trim() });
      toast.success(`"${name.trim()}" qo'shildi`);
      setName("");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setSaving(false);
    }
  }

  async function save(id: string) {
    if (!editName.trim()) return;
    try {
      await api.put(`${apiPath}/${id}`, { name: editName.trim() });
      toast.success("Yangilandi");
      setEditId(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    }
  }

  async function remove(item: Taxonomy) {
    const used =
      (item._count?.news ?? 0) +
      (item._count?.guides ?? 0) +
      (item._count?.opinions ?? 0);

    const warning = used
      ? `"${item.name}" ${used} ta yozuvda ishlatilgan. O'chirilsinmi?`
      : `"${item.name}" o'chirilsinmi?`;
    if (!confirm(warning)) return;

    try {
      await api.delete(`${apiPath}/${item.id}`);
      toast.success("O'chirildi");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h2 className="page-title">{title}</h2>
        <p className="page-sub">{items.length} ta yozuv</p>
      </div>

      {/* Qo'shish */}
      <form onSubmit={create} className="card card-pad mb-5 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Yangi ${title.toLowerCase()} nomi`}
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="btn-primary shrink-0"
        >
          {saving ? (
            <Icon name="spinner" className="h-4 w-4 animate-spin" />
          ) : (
            <Icon name="plus" className="h-4 w-4" />
          )}
          Qo&apos;shish
        </button>
      </form>

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
              <th>Nom</th>
              <th className="w-48">Slug</th>
              <th className="w-32">Ishlatilgan</th>
              <th className="w-28 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>
                  <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-faint">
                    <Icon name="spinner" className="h-4 w-4 animate-spin" />
                    Yuklanmoqda…
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">
                    <Icon name="folder" className="h-7 w-7 text-ink-faint" />
                    <p className="text-sm font-medium text-ink">Hozircha bo&apos;sh</p>
                    <p className="max-w-sm text-sm text-ink-soft">{hint}</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const used =
                  (item._count?.news ?? 0) +
                  (item._count?.guides ?? 0) +
                  (item._count?.opinions ?? 0);
                const editing = editId === item.id;

                return (
                  <tr key={item.id}>
                    <td>
                      {editing ? (
                        <input
                          value={editName}
                          autoFocus
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") save(item.id);
                            if (e.key === "Escape") setEditId(null);
                          }}
                          className="input py-1.5"
                        />
                      ) : (
                        <span className="font-medium text-ink">{item.name}</span>
                      )}
                    </td>
                    <td className="font-mono text-xs text-ink-faint">
                      {item.slug}
                    </td>
                    <td>
                      {used > 0 ? (
                        <span className="pill-muted">{used} ta</span>
                      ) : (
                        <span className="text-xs text-ink-faint">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {editing ? (
                          <>
                            <button
                              onClick={() => save(item.id)}
                              title="Saqlash"
                              className="btn-icon text-ok"
                            >
                              <Icon name="check" className="h-[18px] w-[18px]" />
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              title="Bekor qilish"
                              className="btn-icon"
                            >
                              <Icon name="close" className="h-[18px] w-[18px]" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditId(item.id);
                                setEditName(item.name);
                              }}
                              title="Tahrirlash"
                              className="btn-icon"
                            >
                              <Icon name="pencil" className="h-[18px] w-[18px]" />
                            </button>
                            <button
                              onClick={() => remove(item)}
                              title="O'chirish"
                              className="btn-icon hover:bg-danger-soft hover:text-danger"
                            >
                              <Icon name="trash" className="h-[18px] w-[18px]" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
