"use client";

import { useEffect, useState } from "react";
import TelegramLogin from "@/components/TelegramLogin";
import { PUBLIC_API_URL } from "@/lib/api-url";

interface AuthConfig {
  telegramBotUsername?: string | null;
  emailConfigured?: boolean;
  frontendUrl?: string;
}

export default function AuthSocialBlock() {
  const [botUsername, setBotUsername] = useState(
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || ""
  );
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch(`${PUBLIC_API_URL}/auth/config`)
      .then((r) => r.json())
      .then((j) => {
        const data = j?.data as AuthConfig;
        setConfig(data);
        if (!botUsername && data?.telegramBotUsername) {
          setBotUsername(data.telegramBotUsername);
        }
      })
      .catch(() => setLoadError("Auth sozlamalari yuklanmadi"));
  }, [botUsername]);

  if (config && config.emailConfigured === false) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        Email xizmati hali sozlanmagan (Render&apos;da <code>RESEND_API_KEY</code> kerak).
      </div>
    );
  }

  if (!botUsername) {
    if (loadError) {
      return <p className="text-center text-xs text-red-600">{loadError}</p>;
    }
    return (
      <p className="text-center text-xs text-ink-soft">
        Telegram login sozlanmagan (Render&apos;da TELEGRAM_BOT_TOKEN va TELEGRAM_BOT_USERNAME).
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <TelegramLogin botUsername={botUsername} />
      <p className="text-center text-[11px] text-ink-soft">
        Telegram bilan kirish. Agar tugma ishlamasa, BotFather&apos;da{" "}
        <strong>/setdomain</strong> → frontend domeningizni qo&apos;shing.
        Keyin botda <strong>/start</strong> bosing (xabarlar uchun).
      </p>
    </div>
  );
}
