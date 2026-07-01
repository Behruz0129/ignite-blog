"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Taxonomy } from "@/lib/types";

interface Props {
  apiPath: string; // "/categories" yoki "/tags"
  title: string;
}

export default function TaxonomyManager({ apiPath, title }: Props) {
  const [items, setItems] = useState<Taxonomy[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await api.get<Taxonomy[]>(apiPath);
      setItems(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.post(apiPath, { name });
      setName("");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    }
  }

  async function save(id: string) {
    try {
      await api.put(`${apiPath}/${id}`, { name: editName });
      setEditId(null);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Xatolik");
    }
  }

  async function remove(id: string) {
    if (!confirm("O'chirilsinmi?")) return;
    try {
      await api.delete(`${apiPath}/${id}`);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Xatolik");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">{title}</h1>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <form onSubmit={create} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Yangi nom..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Qo'shish
        </button>
      </form>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3">Nom</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3">Ishlatilgan</th>
              <th className="px-5 py-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  Hozircha yo'q.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const used =
                  (item._count?.news ?? 0) +
                  (item._count?.guides ?? 0) +
                  (item._count?.opinions ?? 0);
                return (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-5 py-3">
                      {editId === item.id ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="rounded border border-slate-300 px-2 py-1"
                        />
                      ) : (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">
                      {item.slug}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{used}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        {editId === item.id ? (
                          <>
                            <button
                              onClick={() => save(item.id)}
                              className="rounded bg-green-50 px-2 py-1 text-xs text-green-600"
                            >
                              Saqlash
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="rounded bg-slate-100 px-2 py-1 text-xs"
                            >
                              Bekor
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditId(item.id);
                                setEditName(item.name);
                              }}
                              className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600"
                            >
                              Tahrir
                            </button>
                            <button
                              onClick={() => remove(item.id)}
                              className="rounded bg-red-50 px-2 py-1 text-xs text-red-600"
                            >
                              O'chir
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
