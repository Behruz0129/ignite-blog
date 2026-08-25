"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth-client";
import { useAuth } from "@/components/AuthProvider";
import AuthSocialBlock from "@/components/AuthSocialBlock";

/**
 * Kirish sahifasi.
 *
 * Asosiy yo'l — Telegram: birinchi kirishning o'zi akkaunt ochadi, shuning
 * uchun alohida "ro'yxatdan o'tish" sahifasi yo'q. Email va parol maydonlari
 * pastda, yopiq holda turadi: ular faqat adminlar uchun kerak va oddiy
 * o'quvchini chalg'itmasligi lozim.
 */
export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      await refresh();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-content flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Kirish</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Telegram bilan bir bosishda kiring — alohida ro&apos;yxatdan o&apos;tish
          shart emas.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6">
          <AuthSocialBlock />
        </div>

        <div className="mt-8 border-t border-line pt-5">
          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full text-center text-xs text-ink-soft underline underline-offset-2 transition hover:text-ink"
            >
              Admin sifatida kirish
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs text-ink-soft">
                Email va parol faqat tahririyat hisoblari uchun.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                className="w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-ink"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parol"
                autoComplete="current-password"
                className="w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-ink"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Kirilmoqda..." : "Kirish"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
