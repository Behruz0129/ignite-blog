/**
 * RATE LIMITING
 * -------------
 * Bir IP manzildan kelgan so'rovlar sonini cheklaydi.
 * Bu DDoS va parol "brute-force" hujumlaridan himoya qiladi.
 *
 * - readLimiter:  public GET so'rovlari (keng limit)
 * - writeLimiter: yozuv amallari (POST/PUT/PATCH/DELETE)
 * - authLimiter:  login/register/parol tiklash (qattiq)
 * - refreshLimiter: token yangilash (o'rtacha)
 */

import rateLimit from "express-rate-limit";
import type { Request } from "express";
import { env } from "../config/env";

/**
 * Ichki (server-to-server) so'rovlarni limitdan chiqarish.
 *
 * MUHIM: Next.js public sayti sahifalarni serverda render qiladi (SSR/ISR),
 * ya'ni barcha o'qish so'rovlari BITTA IP dan — Next serverining IP'sidan —
 * keladi. Oddiy IP limiti bunda tashrifchini emas, saytning O'ZINI bo'g'adi:
 * minglab maqola revalidate bo'lganda limit bir zumda tugaydi va butun sayt
 * 429 qaytara boshlaydi.
 *
 * Yechim: Next serveri so'rovlarga maxfiy sarlavha qo'shadi va shu sarlavha
 * mos kelsa limit qo'llanmaydi. INTERNAL_API_TOKEN belgilanmagan bo'lsa
 * (masalan lokal dev'da) bu mexanizm o'chiq bo'ladi.
 */
function isInternalRequest(req: Request): boolean {
  if (!env.INTERNAL_API_TOKEN) return false;
  return req.get("x-internal-token") === env.INTERNAL_API_TOKEN;
}

/**
 * Public o'qish (GET). Bular keshlanadigan va arzon so'rovlar, shuning uchun
 * limit keng — maqsad haqiqiy o'quvchini bloklamay, faqat qo'pol
 * skreyping/DDoS ni jilovlash.
 */
export const readLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.RATE_LIMIT_READ_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== "GET" || isInternalRequest(req),
  message: {
    success: false,
    message: "Juda ko'p so'rov yuborildi. Birozdan keyin urinib ko'ring.",
  },
});

/** Yozuv amallari — bular qimmat va kamdan-kam, limit torroq. */
export const writeLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "GET" || isInternalRequest(req),
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
