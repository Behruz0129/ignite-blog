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

/**
 * Parol tanlash (brute-force) mumkin bo'lgan endpointlar uchun: login,
 * register, forgot/reset password, email tasdiqlash.
 *
 * `skipSuccessfulRequests` MUHIM: limit faqat MUVAFFAQIYATSIZ urinishlarni
 * sanaydi. Aks holda oddiy foydalanuvchi kun davomida bir necha marta kirsa
 * yoki bir nechta qurilmadan foydalansa, hech qanday hujum qilmasa ham
 * o'zini bloklab qo'yardi.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 10, // har 15 daqiqada 10 ta MUVAFFAQIYATSIZ urinish
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Juda ko'p kirish urinishi. 15 daqiqadan keyin qayta urinib ko'ring.",
  },
});

/**
 * Token yangilash uchun alohida, yumshoqroq limit.
 *
 * Nega alohida? /auth/refresh — foydalanuvchi bosadigan tugma emas, balki
 * access token muddati tugaganda mijoz AVTOMATIK chaqiradigan endpoint.
 * Uni login bilan bir xil qattiq limitga qo'yish faol foydalanuvchini
 * (ayniqsa bir nechta ochiq varaq bilan) sababsiz tizimdan chiqarib
 * yuborardi. Ayni paytda bu ham cheksiz emas — o'g'irlangan token bilan
 * cheksiz urinishning oldini oladi.
 */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Juda ko'p token yangilash so'rovi. Birozdan keyin urinib ko'ring.",
  },
});
