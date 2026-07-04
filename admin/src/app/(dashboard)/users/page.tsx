"use client";

import { useEffect, useState } from "react";
import { api, buildQuery } from "@/lib/api";
import { getUser, isSuperAdmin } from "@/lib/auth";
import type { User, Role } from "@/lib/types";

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Asosiy admin",
  ADMIN: "Yordamchi admin",
  USER: "Foydalanuvchi",
};

export default function UsersPage() {
  const currentUser = getUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN" as "ADMIN" | "USER",
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<User[]>(`/users${buildQuery({ limit: 50 })}`);
      setUsers(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isSuperAdmin(currentUser?.role)) load();
  }, [currentUser?.role]);

  if (!isSuperAdmin(currentUser?.role)) {
    return (
      <div className="rounded-xl bg-white p-8 text-slate-600">
        Bu sahifa faqat asosiy admin uchun.
      </div>
    );
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/users", form);
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "ADMIN" });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xatolik");
    }
  }

  async function changeRole(id: string, role: Role) {
    try {
      await api.patch(`/users/${id}/role`, { role });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xatolik");
    }
  }

  async function resetPassword(id: string) {
    const password = prompt("Yangi parol (min 8, katta+kichik+raqam):");
    if (!password) return;
    try {
      await api.patch(`/users/${id}/password`, { password });
      alert("Parol yangilandi");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xatolik");
    }
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`"${name}" ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xatolik");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Foydalanuvchilar</h1>
          <p className="text-sm text-slate-500">
            Yordamchi adminlar va foydalanuvchilarni boshqaring
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          {showForm ? "Bekor qilish" : "+ Yangi foydalanuvchi"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createUser}
          className="mb-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 font-semibold">Yangi foydalanuvchi</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Ism"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border px-3 py-2 text-sm"
            />
            <input
              required
              type="password"
              placeholder="Parol"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-lg border px-3 py-2 text-sm"
            />
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as "ADMIN" | "USER" })
              }
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="ADMIN">Yordamchi admin</option>
              <option value="USER">Foydalanuvchi</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm text-white"
          >
            Yaratish
          </button>
        </form>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Ism</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Foydalanuvchi yo'q
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.id === currentUser?.id ? (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                        {ROLE_LABELS[u.role]} (siz)
                      </span>
                    ) : u.role === "SUPER_ADMIN" ? (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                        {ROLE_LABELS[u.role]}
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) =>
                          changeRole(u.id, e.target.value as Role)
                        }
                        className="rounded border px-2 py-1 text-xs"
                      >
                        <option value="ADMIN">Yordamchi admin</option>
                        <option value="USER">Foydalanuvchi</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.provider || "LOCAL"}</td>
                  <td className="px-4 py-3">
                    {u.role !== "SUPER_ADMIN" && u.id !== currentUser?.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => resetPassword(u.id)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Parol
                        </button>
                        <button
                          onClick={() => deleteUser(u.id, u.name)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          O'chirish
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
