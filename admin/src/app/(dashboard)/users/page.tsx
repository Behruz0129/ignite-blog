"use client";

import { useEffect, useState } from "react";
import { api, buildQuery } from "@/lib/api";
import { getUser, isSuperAdmin } from "@/lib/auth";
import type { User, Role } from "@/lib/types";
import { initial } from "@/lib/format";
import Icon from "@/components/Icon";
import { useToast } from "@/components/Toast";

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Asosiy admin",
  ADMIN: "Yordamchi admin",
  USER: "Foydalanuvchi",
};

export default function UsersPage() {
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN" as "ADMIN" | "USER",
  });

  // localStorage faqat brauzerda — effekt ichida o'qiymiz
  useEffect(() => setCurrentUser(getUser()), []);

  const allowed = isSuperAdmin(currentUser?.role);

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
    if (allowed) load();
  }, [allowed]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/users", form);
      toast.success(`${form.name} qo'shildi`);
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "ADMIN" });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setCreating(false);
    }
  }

  async function changeRole(id: string, role: Role) {
    try {
      await api.patch(`/users/${id}/role`, { role });
      toast.success("Rol o'zgartirildi");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xatolik");
    }
  }

  async function resetPassword(id: string) {
    const password = prompt("Yangi parol (kamida 8 belgi, katta+kichik+raqam):");
    if (!password) return;
    try {
      await api.patch(`/users/${id}/password`, { password });
      toast.success("Parol yangilandi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xatolik");
    }
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`"${name}" o'chirilsinmi?`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("O'chirildi");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xatolik");
    }
  }

  if (currentUser && !allowed) {
    return (
      <div className="card empty-state">
        <Icon name="users" className="h-7 w-7 text-ink-faint" />
        <p className="text-sm font-medium text-ink">Ruxsat yo&apos;q</p>
        <p className="text-sm text-ink-soft">
          Bu sahifa faqat asosiy admin uchun.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="page-title">Foydalanuvchilar</h2>
          <p className="page-sub">
            Yordamchi adminlar va o&apos;quvchi hisoblarini boshqarish
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className={showForm ? "btn-secondary" : "btn-primary"}
        >
          <Icon name={showForm ? "close" : "plus"} className="h-4 w-4" />
          {showForm ? "Bekor qilish" : "Yangi foydalanuvchi"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createUser} className="card card-pad mb-5">
          <h3 className="card-title mb-4">Yangi foydalanuvchi</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Ism</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="To'liq ism"
              />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input
                required
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="ism@igniteblog.com"
              />
            </div>
            <div>
              <label className="field-label">Parol</label>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
                placeholder="Kamida 8 belgi"
              />
            </div>
            <div>
              <label className="field-label">Rol</label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as "ADMIN" | "USER" })
                }
                className="select"
              >
                <option value="ADMIN">Yordamchi admin</option>
                <option value="USER">Foydalanuvchi</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={creating} className="btn-primary mt-4">
            {creating && <Icon name="spinner" className="h-4 w-4 animate-spin" />}
            Yaratish
          </button>
        </form>
      )}

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
              <th>Foydalanuvchi</th>
              <th className="w-56">Rol</th>
              <th className="w-32">Kirish usuli</th>
              <th className="w-32 text-right">Amallar</th>
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
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">
                    <Icon name="users" className="h-7 w-7 text-ink-faint" />
                    <p className="text-sm text-ink-soft">Foydalanuvchi yo&apos;q</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isMe = u.id === currentUser?.id;
                const locked = u.role === "SUPER_ADMIN" || isMe;

                return (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-[13px] font-semibold text-ink-soft">
                          {initial(u.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">
                            {u.name}
                            {isMe && (
                              <span className="ml-1.5 text-xs font-normal text-ink-faint">
                                (siz)
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-ink-faint">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {locked ? (
                        <span
                          className={
                            u.role === "SUPER_ADMIN" ? "pill-brand" : "pill-muted"
                          }
                        >
                          {ROLE_LABELS[u.role]}
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) =>
                            changeRole(u.id, e.target.value as Role)
                          }
                          className="select py-1.5 text-[13px]"
                        >
                          <option value="ADMIN">Yordamchi admin</option>
                          <option value="USER">Foydalanuvchi</option>
                        </select>
                      )}
                    </td>
                    <td className="text-xs text-ink-soft">
                      {u.provider || "LOCAL"}
                    </td>
                    <td>
                      {!locked && (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => resetPassword(u.id)}
                            title="Parolni almashtirish"
                            className="btn-icon"
                          >
                            <Icon name="pencil" className="h-[18px] w-[18px]" />
                          </button>
                          <button
                            onClick={() => deleteUser(u.id, u.name)}
                            title="O'chirish"
                            className="btn-icon hover:bg-danger-soft hover:text-danger"
                          >
                            <Icon name="trash" className="h-[18px] w-[18px]" />
                          </button>
                        </div>
                      )}
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
