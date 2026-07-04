"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, resendVerification } from "@/lib/auth-client";
import { useAuth } from "@/components/AuthProvider";
import AuthSocialBlock from "@/components/AuthSocialBlock";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedsVerify(false);
    setLoading(true);
    try {
      await login(email, password);
      await refresh();
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Xatolik";
      setError(msg);
      if (msg.includes("tasdiqlanmagan")) setNeedsVerify(true);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    try {
      await resendVerification(email);
      setError("Tasdiqlash xabari qayta yuborildi. Pochtangizni tekshiring.");
      setNeedsVerify(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    }
  }

  return (
    <div className="container-content flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Kirish</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Hisobingiz yo&apos;qmi?{" "}
          <Link href="/register" className="text-ink underline">
            Ro&apos;yxatdan o&apos;ting
          </Link>
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            {needsVerify && (
              <button
                type="button"
                onClick={resend}
                className="mt-2 block text-ink underline"
              >
                Tasdiqlash xabarini qayta yuborish
              </button>
            )}
          </div>
        )}

        <div className="mt-6">
          <AuthSocialBlock />
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs text-ink-soft">yoki email</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parol"
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-ink-soft underline">
              Parolni unutdingizmi?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>
      </div>
    </div>
  );
}
