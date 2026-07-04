"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/auth-client";
import { useAuth } from "@/components/AuthProvider";

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { refresh } = useAuth();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Token topilmadi");
      return;
    }

    verifyEmail(token)
      .then(async () => {
        setStatus("ok");
        setMessage("Email tasdiqlandi! Yo'naltirilmoqdasiz...");
        await refresh();
        setTimeout(() => router.replace("/"), 1500);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Xatolik");
      });
  }, [params, refresh, router]);

  return (
    <div className="container-content flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      {status === "loading" && <p className="text-ink-soft">Email tasdiqlanmoqda...</p>}
      {status === "ok" && (
        <div className="rounded-xl bg-haze px-6 py-4">
          <p className="font-medium text-ink">{message}</p>
        </div>
      )}
      {status === "error" && (
        <div>
          <p className="text-red-600">{message}</p>
          <Link href="/login" className="mt-4 inline-block text-sm underline">
            Login sahifasiga
          </Link>
        </div>
      )}
    </div>
  );
}
