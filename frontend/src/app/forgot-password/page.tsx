"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const msg = await forgotPassword(email);
      setMessage(msg);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-content flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Parolni unutdingizmi?</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Email kiriting. Agar Telegram bog&apos;langan bo&apos;lsa, bot orqali ham yuboramiz.
        </p>

        {message && (
          <div className="mt-4 rounded-xl bg-haze px-4 py-3 text-sm text-ink">{message}</div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? "Yuborilmoqda..." : "Tiklash havolasini yuborish"}
          </button>
        </form>

        <Link href="/login" className="mt-4 inline-block text-sm text-ink-soft underline">
          ← Kirish sahifasiga
        </Link>
      </div>
    </div>
  );
}
