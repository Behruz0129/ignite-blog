"use client";

import { useEffect, useRef } from "react";
import { telegramLogin } from "@/lib/auth-client";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, unknown>) => void;
  }
}

interface Props {
  botUsername: string;
}

export default function TelegramLogin({ botUsername }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { refresh } = useAuth();

  useEffect(() => {
    if (!botUsername || !containerRef.current) return;

    window.onTelegramAuth = async (user) => {
      try {
        await telegramLogin(user);
        await refresh();
        router.push("/");
      } catch (err) {
        alert(err instanceof Error ? err.message : "Telegram kirish xatosi");
      }
    };

    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    containerRef.current.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [botUsername, refresh, router]);

  if (!botUsername) return null;

  return (
    <div className="flex justify-center">
      <div ref={containerRef} />
    </div>
  );
}
