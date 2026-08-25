"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeOAuthCode } from "@/lib/auth-client";
import { useAuth } from "@/components/AuthProvider";

export default function AuthCallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [error, setError] = useState("");
  // Kod bir martalik: React qat'iy rejimda effekt ikki marta ishlasa,
  // ikkinchi urinish "kod yaroqsiz" xatosini berardi.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const err = params.get("error");
    if (err) {
      setError(decodeURIComponent(err));
      return;
    }

    const code = params.get("code");
    if (!code) {
      setError("Kirish kodi topilmadi");
      return;
    }

    exchangeOAuthCode(code)
      .then(() => refresh())
      .then(() => router.replace("/"))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Kirish yakunlanmadi");
      });
  }, [params, refresh, router]);

  if (error) {
    return (
      <div className="container-content flex min-h-[50vh] flex-col items-center justify-center">
        <p className="text-red-600">{error}</p>
        <a href="/login" className="mt-4 text-sm underline">
          Login sahifasiga qaytish
        </a>
      </div>
    );
  }

  return (
    <div className="container-content flex min-h-[50vh] items-center justify-center text-ink-soft">
      Kirish amalga oshirilmoqda...
    </div>
  );
}
