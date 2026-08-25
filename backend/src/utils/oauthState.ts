/**
 * OAUTH STATE (CSRF himoyasi)
 * ---------------------------
 * OAuth oqimida `state` bo'lmasa "login CSRF" hujumi mumkin: hujumchi o'z
 * provayder akkauntining callback havolasini qurbonga bosdiradi va qurbon
 * bilmagan holda hujumchining akkauntiga kirib qoladi (keyin u yerga
 * yozgan hamma narsasi hujumchida qoladi).
 *
 * Yechim — "double submit": tasodifiy qiymat bir vaqtning o'zida
 * HttpOnly cookie'ga ham, `state` parametriga ham yoziladi. Callback'da
 * ikkalasi solishtiriladi. Hujumchi qurbonning brauzerida cookie o'rnata
 * olmagani uchun mos juftlikni yasay olmaydi.
 *
 * Sessiya (express-session) ataylab ishlatilmadi: server holatsiz qolsin va
 * bir nechta instansiyada ham ishlayversin.
 */

import crypto from "crypto";
import type { Request, Response } from "express";
import { env } from "../config/env";

const COOKIE_NAME = "oauth_state";
/** Foydalanuvchi provayder sahifasida qancha turishi mumkin. */
const MAX_AGE_MS = 10 * 60 * 1000;

export function createState(res: Response): string {
  const state = crypto.randomBytes(32).toString("hex");

  res.cookie(COOKIE_NAME, state, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    // OAuth qaytishi boshqa saytdan (provayderdan) keladi, shuning uchun
    // "strict" cookie'ni yubormaydi va tekshiruv doim yiqilardi.
    sameSite: "lax",
    maxAge: MAX_AGE_MS,
    path: "/api/auth",
  });

  return state;
}

/** Callback'dagi `state` cookie'dagisiga mos kelishini tekshiradi. */
export function verifyState(req: Request, res: Response): boolean {
  const fromQuery = typeof req.query.state === "string" ? req.query.state : "";
  const fromCookie = req.cookies?.[COOKIE_NAME] as string | undefined;

  // Kod bir marta ishlatiladi — tekshirilgach cookie darhol o'chiriladi.
  res.clearCookie(COOKIE_NAME, { path: "/api/auth" });

  if (!fromQuery || !fromCookie) return false;
  if (fromQuery.length !== fromCookie.length) return false;

  // Uzunliklar teng bo'lgani uchun timingSafeEqual xavfsiz ishlaydi.
  return crypto.timingSafeEqual(Buffer.from(fromQuery), Buffer.from(fromCookie));
}
