/**
 * CACHE-CONTROL (public o'qish uchun)
 * ----------------------------------
 * Bu middleware public GET javoblariga kesh sarlavhalarini qo'yadi, toki
 * Nginx / Cloudflare / Vercel kabi oraliq qatlamlar javobni o'zida saqlab
 * tursin. Shunda o'n minglab tashrifchining katta qismi backend'ga umuman
 * yetib bormaydi.
 *
 *   s-maxage=60             -> CDN 60 soniya "yangi" deb hisoblaydi
 *   stale-while-revalidate  -> muddati o'tgach ham eskisini darhol beradi
 *                              va fonda yangisini oladi (foydalanuvchi
 *                              hech qachon kutmaydi)
 *
 * DIQQAT — nima uchun autentifikatsiyalangan so'rovlar keshlanmaydi:
 * public endpointlar `optionalAuth` ishlatadi, ya'ni token bo'lsa javobga
 * `likedByMe` qo'shiladi. Bunday javob foydalanuvchiga XOS. Uni umumiy
 * keshga qo'yish bir kishining "like" holatini boshqalarga ko'rsatib
 * qo'yardi. Shuning uchun Authorization sarlavhasi bo'lsa — no-store,
 * va har doim `Vary: Authorization` qo'yiladi.
 */

import { Request, Response, NextFunction } from "express";

export function publicCache(maxAgeSeconds = 60, swrSeconds = 300) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Oraliq keshlar javob Authorization'ga bog'liqligini bilishi shart
    res.setHeader("Vary", "Authorization, Accept-Encoding, Origin");

    if (req.method !== "GET" || req.headers.authorization) {
      res.setHeader("Cache-Control", "private, no-store");
      return next();
    }

    res.setHeader(
      "Cache-Control",
      `public, max-age=0, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${swrSeconds}`
    );
    next();
  };
}
