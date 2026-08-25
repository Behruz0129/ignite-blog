/**
 * TELEGRAM AVTOPOSTING
 * --------------------
 * Maqola chop etilganda kanalga xabar yuboradi.
 *
 * Ikki qoida ustida quriladi:
 *
 * 1. **Yuborish hech qachon chop etishni buzmaydi.** Telegram javob bermasa
 *    yoki kanal noto'g'ri sozlangan bo'lsa ham maqola chop etilaveradi —
 *    xato faqat logga yoziladi. Shuning uchun chaqiruvchi kod natijani
 *    kutmaydi (`void`).
 * 2. **Bir maqola bir marta.** Yuborilgani `telegramPostedAt` ga yoziladi;
 *    keyin tahrirlansa yoki qayta chop etilsa obunachilar takroriy xabar
 *    olmaydi.
 */

import { prisma } from "../config/prisma";
import { env, frontendUrl, isTelegramChannelConfigured } from "../config/env";
import { logger } from "../config/logger";

/** Kontent turi → saytdagi yo'l va xabardagi belgi. */
const KIND = {
  NEWS: { path: "news", label: "Yangilik", emoji: "📰" },
  GUIDE: { path: "guides", label: "Qo'llanma", emoji: "🎮" },
  OPINION: { path: "opinions", label: "Maqola", emoji: "✍️" },
} as const;

export type ContentKind = keyof typeof KIND;

interface PostableContent {
  id: string;
  type: ContentKind;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  telegramPostedAt?: Date | null;
  categories?: { name: string }[];
  tags?: { name: string }[];
}

/** Telegram HTML rejimida `<`, `>`, `&` escape qilinishi shart. */
function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Nomni hashtagga aylantiradi: "PC o'yinlar" → "#PC_oyinlar".
 * Telegram teglarida faqat harf, raqam va pastki chiziq ishlaydi.
 */
export function toHashtag(name: string): string {
  const clean = name
    .trim()
    .replace(/['''`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");
  return clean ? `#${clean}` : "";
}

export function buildMessage(item: PostableContent): string {
  const meta = KIND[item.type];
  const url = `${frontendUrl}/${meta.path}/${item.slug}`;

  const tags = [...(item.categories ?? []), ...(item.tags ?? [])]
    .map((t) => toHashtag(t.name))
    .filter(Boolean)
    .slice(0, 5)
    .join(" ");

  const lines = [
    `${meta.emoji} <b>${escapeHtml(item.title)}</b>`,
    "",
    item.excerpt ? escapeHtml(item.excerpt.trim()) : "",
    "",
    tags,
    `<a href="${url}">Batafsil o'qish →</a>`,
  ];

  return lines.filter((line, i) => line !== "" || lines[i - 1] !== "").join("\n");
}

async function callTelegram(method: string, payload: Record<string, unknown>) {
  const res = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const json = (await res.json()) as { ok: boolean; description?: string };
  if (!json.ok) throw new Error(json.description || "Telegram javob bermadi");
  return json;
}

export const telegramPostService = {
  /**
   * Maqolani kanalga yuboradi. Chaqiruvchi natijani kutmasligi mumkin.
   * Yuborilgani bazaga belgilanadi, shuning uchun takror yuborilmaydi.
   */
  async publish(item: PostableContent): Promise<boolean> {
    if (!isTelegramChannelConfigured) return false;
    if (item.telegramPostedAt) return false; // allaqachon yuborilgan

    const text = buildMessage(item);
    const chatId = env.TELEGRAM_CHANNEL_ID as string;

    try {
      if (item.featuredImage) {
        // Rasm bilan yuborishda caption 1024 belgidan oshmasligi kerak.
        await callTelegram("sendPhoto", {
          chat_id: chatId,
          photo: item.featuredImage,
          caption: text.slice(0, 1024),
          parse_mode: "HTML",
        });
      } else {
        await callTelegram("sendMessage", {
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          link_preview_options: { prefer_large_media: true },
        });
      }

      await prisma.post.update({
        where: { id: item.id },
        data: { telegramPostedAt: new Date() },
      });

      logger.info(`Telegram: "${item.title}" kanalga yuborildi`);
      return true;
    } catch (error) {
      // Chop etish muvaffaqiyatli bo'ldi — faqat e'lon ketmadi.
      logger.error(
        `Telegram avtoposting xatosi ("${item.title}"): ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return false;
    }
  },
};
