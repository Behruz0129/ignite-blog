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
  JWT_EXPIRES_IN: z.string().default("7d"),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default("ignite-blog"),

  ADMIN_NAME: z.string().default("Super Admin"),
  ADMIN_EMAIL: z.string().email().default("admin@igniteblog.com"),
  ADMIN_PASSWORD: z.string().default("Admin12345!"),

  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().default(15),
  RATE_LIMIT_MAX: z.coerce.number().default(300),
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

// CORS origin ro'yxatini massivga aylantiramiz
export const corsOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
