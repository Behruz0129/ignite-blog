"use client";

import { useState } from "react";
import Link from "next/link";
import { register } from "@/lib/auth-client";
import AuthSocialBlock from "@/components/AuthSocialBlock";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const msg = await register(name, email, password);
      setMessage(msg);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="container-content flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl bg-haze p-8 text-center">
          <h1 className="text-xl font-semibold">Pochtangizni tekshiring</h1>
          <p className="mt-3 text-sm text-ink-soft">{message}</p>
          <Link href="/login" className="btn-primary mt-6 inline-block">
            Login sahifasiga
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-content flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">
          Ro&apos;yxatdan o&apos;tish
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Hisobingiz bormi?{" "}
          <Link href="/login" className="text-ink underline">
            Kirish
          </Link>
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ismingiz"
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
          />
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
            placeholder="Parol (min 8, katta+kichik+raqam)"
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}
          </button>
        </form>
      </div>
    </div>
  );
}
