"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveAuth } from "@/lib/auth-client";
import { useAuth } from "@/components/AuthProvider";

export default function AuthCallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const err = params.get("error");
    if (err) {
      setError(decodeURIComponent(err));
      return;
    }

    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    if (!token) {
      setError("Token topilmadi");
      return;
    }

    saveAuth(
      token,
      { id: "", name: "", email: "", role: "USER" },
      refreshToken || undefined
    );
    refresh().then(() => router.replace("/"));
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
