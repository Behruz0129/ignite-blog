/**
 * ENV CONFIG
 * ----------
 * Barcha muhit o'zgaruvchilarini (.env) bitta joyda o'qiymiz va tekshiramiz.
 * Agar majburiy qiymat yo'q bo'lsa, dastur ishga tushishidayoq xato beradi.
 * Bu "keyinroq tushunarsiz xatolar"ning oldini oladi.
 */

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL majburiy"),

  JWT_SECRET: z.string().min(10, "JWT_SECRET kamida 10 belgidan iborat bo'lishi kerak"),
  JWT_EXPIRES_IN: z.string().default("7d"), // access token muddati
  REFRESH_TOKEN_DAYS: z.coerce.number().default(30), // refresh token muddati (kun)

  // --- OAuth (ixtiyoriy; to'ldirilmasa o'sha provayder o'chiq bo'ladi) ---
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  // Backend'ning ommaviy manzili (OAuth callback qurish uchun), masalan:
  // https://ignite-api-7qhs.onrender.com
  OAUTH_CALLBACK_BASE: z.string().default("http://localhost:5000"),
  // Public frontend manzili (OAuth'dan keyin redirect uchun)
  FRONTEND_URL: z.string().default("http://localhost:3000"),

  // --- Telegram Login ---
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  // Yangi maqolalar avtomatik yuboriladigan kanal (masalan "@ignite_uz" yoki
  // raqamli id). Bo'sh bo'lsa avtoposting o'chiq bo'ladi.
  TELEGRAM_CHANNEL_ID: z.string().optional(),
  TELEGRAM_BOT_USERNAME: z.string().optional(), // @sizsiz bot username (BotFather)

  // --- Email (Resend) ---
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Ignite Blog <onboarding@resend.dev>"),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default("ignite-blog"),

  ADMIN_NAME: z.string().default("Super Admin"),
  ADMIN_EMAIL: z.string().email().default("admin@igniteblog.com"),
  ADMIN_PASSWORD: z.string().default("Admin12345!"),

  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().default(15),
  // Yozuv amallari (POST/PUT/PATCH/DELETE) uchun
  RATE_LIMIT_MAX: z.coerce.number().default(300),
  // Public o'qish (GET) uchun — keshlanadigan, arzon so'rovlar
  RATE_LIMIT_READ_MAX: z.coerce.number().default(2000),

  // Next.js serveri (SSR/ISR) so'rovlarini rate limitdan chiqarish uchun
  // maxfiy sarlavha qiymati. Bo'sh bo'lsa bu mexanizm o'chiq bo'ladi.
  INTERNAL_API_TOKEN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌  Muhit o'zgaruvchilarida (.env) xato bor:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// Cloudinary sozlanganligini bilish uchun yordamchi
export const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
);

/**
 * Ruxsat etilgan originlar.
 *
 * `FRONTEND_URL` ham qo'shiladi: u ommaviy saytning manzilini allaqachon
 * biladi, shuning uchun `CORS_ORIGIN` chala to'ldirilsa ham sayt ishlab
 * turaveradi. Bir marta `CORS_ORIGIN` prodda umuman o'rnatilmay qolgan va
 * default `http://localhost:3000` sifatida qolib ketgan edi — natijada
 * saytdagi kirish, like va izohlar jimgina bloklangan.
 */
/**
 * Manzil oxiridagi `/` ni olib tashlaydi.
 *
 * `${FRONTEND_URL}/auth/callback` kabi birikmalar hamma joyda ishlatiladi;
 * env'da oxirida slash qolsa `//auth/callback` hosil bo'ladi. Ba'zi
 * provayderlar (OAuth redirect_uri) buni boshqa manzil deb hisoblaydi.
 */
function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Ommaviy sayt manzili — email havolalari va OAuth qaytishi shunga tayanadi. */
export const frontendUrl = trimSlash(env.FRONTEND_URL);

/** Backend'ning o'z manzili — OAuth callback shundan quriladi. */
export const oauthCallbackBase = trimSlash(env.OAUTH_CALLBACK_BASE);

export const corsOrigins = Array.from(
  new Set(
    [...env.CORS_ORIGIN.split(","), env.FRONTEND_URL]
      .map((o) => o?.trim().replace(/\/$/, ""))
      .filter((o): o is string => Boolean(o))
  )
);

/** Prodda localhost'dan boshqa origin yo'q bo'lsa — sozlama unutilgan. */
export const corsLooksMisconfigured =
  env.NODE_ENV === "production" &&
  corsOrigins.every((o) => o.includes("localhost") || o.includes("127.0.0.1"));

// OAuth provayderlar sozlanganligini bilish uchun yordamchilar
export const isGoogleConfigured = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
);
export const isDiscordConfigured = Boolean(
  env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET
);
/** Avtoposting uchun bot tokeni ham, kanal ham kerak. */
export const isTelegramChannelConfigured = Boolean(
  env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHANNEL_ID
);

export const isTelegramConfigured = Boolean(
  env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_BOT_USERNAME
);
export const isEmailConfigured = Boolean(env.RESEND_API_KEY);
