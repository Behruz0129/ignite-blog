"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth-client";

export default function ResetPasswordClient() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setMessage("Token topilmadi");
      return;
    }
    setLoading(true);
    try {
      const msg = await resetPassword(token, password);
      setMessage(msg);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="container-content py-16 text-center text-red-600">
        Noto&apos;g&apos;ri havola.{" "}
        <Link href="/forgot-password" className="underline">
          Qayta so&apos;rang
        </Link>
      </div>
    );
  }

  return (
    <div className="container-content flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Yangi parol</h1>

        {message && (
          <div className="mt-4 rounded-xl bg-haze px-4 py-3 text-sm text-ink">{message}</div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Yangi parol (min 8, katta+kichik+raqam)"
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? "Saqlanmoqda..." : "Parolni saqlash"}
          </button>
        </form>
      </div>
    </div>
  );
}
