/**
 * TELEGRAM AUTH
 * -------------
 * Telegram Login Widget ma'lumotlarini bot token bilan tekshiradi.
 * https://core.telegram.org/widgets/login#checking-authorization
 */

import crypto from "crypto";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function verifyTelegramAuth(data: TelegramAuthData): void {
  if (!env.TELEGRAM_BOT_TOKEN) {
    throw AppError.badRequest("Telegram auth sozlanmagan");
  }

  const { hash } = data;
  if (!hash) throw AppError.badRequest("Telegram hash topilmadi");

  const now = Math.floor(Date.now() / 1000);
  if (now - data.auth_date > 86400) {
    throw AppError.badRequest("Telegram sessiyasi muddati tugagan. Qayta urinib ko'ring.");
  }

  const fields: Record<string, string | number> = {
    auth_date: data.auth_date,
    first_name: data.first_name,
    id: data.id,
  };
  if (data.last_name) fields.last_name = data.last_name;
  if (data.username) fields.username = data.username;
  if (data.photo_url) fields.photo_url = data.photo_url;

  const checkString = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(env.TELEGRAM_BOT_TOKEN).digest();
  const computed = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  if (computed !== hash) {
    throw AppError.unauthorized("Telegram autentifikatsiya yaroqsiz");
  }
}

/** Parol tiklash kodi yoki bildirishnoma yuborish */
export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      }
    );
    const json = (await res.json()) as { ok: boolean };
    return json.ok;
  } catch {
    return false;
  }
}
