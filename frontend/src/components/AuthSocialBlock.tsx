"use client";

import { useEffect, useState } from "react";
import TelegramLogin from "@/components/TelegramLogin";
import { PUBLIC_API_URL } from "@/lib/api-url";

export default function AuthSocialBlock() {
  const [botUsername, setBotUsername] = useState(
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || ""
  );

  useEffect(() => {
    if (botUsername) return;
    fetch(`${PUBLIC_API_URL}/auth/config`)
      .then((r) => r.json())
      .then((j) => {
        if (j?.data?.telegramBotUsername) {
          setBotUsername(j.data.telegramBotUsername);
        }
      })
      .catch(() => {});
  }, [botUsername]);

  if (!botUsername) return null;

  return (
    <div className="space-y-3">
      <TelegramLogin botUsername={botUsername} />
      <p className="text-center text-[11px] text-ink-soft">
        Telegram bot orqali tez kirish. Keyin bot orqali xabar olish uchun botda{" "}
        <strong>/start</strong> bosing.
      </p>
    </div>
  );
}
