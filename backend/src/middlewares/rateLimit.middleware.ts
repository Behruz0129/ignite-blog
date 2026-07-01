/**
 * RATE LIMITING
 * -------------
 * Bir IP manzildan kelgan so'rovlar sonini cheklaydi.
 * Bu DDoS va parol "brute-force" hujumlaridan himoya qiladi.
 *
 * - apiLimiter: umumiy API uchun (yumshoqroq).
 * - authLimiter: login uchun (qattiqroq - parol tanlashni qiyinlashtiradi).
 */

import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Juda ko'p so'rov yuborildi. Birozdan keyin urinib ko'ring.",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 10, // har 15 daqiqada 10 ta urinish
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Juda ko'p kirish urinishi. 15 daqiqadan keyin qayta urinib ko'ring.",
  },
});
