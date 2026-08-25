"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveAuth, isAdminRole } from "@/lib/auth";
import type { User } from "@/lib/types";
import Icon from "@/components/Icon";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<{
        token: string;
        refreshToken: string;
        user: User;
      }>("/auth/login", { email, password });

      if (!isAdminRole(res.data.user.role)) {
        throw new Error("Bu panel faqat adminlar uchun");
      }

      saveAuth(res.data.token, res.data.user, res.data.refreshToken);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kirishda xatolik");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Chap tomon — brend */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-rail p-12 text-white lg:flex">
        {/* Yumshoq yorug'lik dog'i */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-1/4 h-[28rem] w-[28rem] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(109,60,230,0.85) 0%, rgba(109,60,230,0) 70%)",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-base font-bold">
            I
          </span>
          <span className="text-[15px] font-semibold">Ignite Blog</span>
        </div>

        <div className="relative max-w-sm">
          <h2 className="text-[32px] font-semibold leading-[1.2] tracking-[-0.02em]">
            Yozing, tartibga soling,
            <br />
            chop eting.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/55">
            Yangiliklar, qo&apos;llanmalar va maqolalar uchun boshqaruv paneli.
          </p>
        </div>

        <p className="relative text-xs text-white/35">
          Gaming blog kontent boshqaruv tizimi
        </p>
      </div>

      {/* O'ng tomon — forma */}
      <div className="flex items-center justify-center bg-canvas px-5 py-12">
        <div className="w-full max-w-sm">
          {/* Kichik ekranda logotip shu yerda */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-base font-bold text-white">
              I
            </span>
            <span className="text-[15px] font-semibold text-ink">
              Ignite Blog
            </span>
          </div>

          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">
            Xush kelibsiz
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Davom etish uchun hisobingizga kiring.
          </p>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-3 text-sm text-danger">
              <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="field-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-lg"
                placeholder="admin@igniteblog.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                Parol
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-lg pr-11"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-ink-faint transition hover:text-ink"
                >
                  <Icon
                    name={showPassword ? "eyeOff" : "eye"}
                    className="h-[18px] w-[18px]"
                  />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading && (
                <Icon name="spinner" className="h-4 w-4 animate-spin" />
              )}
              {loading ? "Kirilmoqda…" : "Kirish"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
