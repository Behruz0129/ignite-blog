/**
 * AUTH CONTROLLER
 */

import { Request, Response } from "express";
import passport from "passport";
import { asyncHandler } from "../utils/asyncHandler";
import { authService } from "../services/auth.service";
import { ok } from "../utils/apiResponse";
import { AppError } from "../utils/AppError";
import {
  env,
  frontendUrl,
  isGoogleConfigured,
  isDiscordConfigured,
  isTelegramConfigured,
} from "../config/env";
import type { User as PrismaUser } from "@prisma/client";
import { authCodeService } from "../services/authCode.service";
import { createState, verifyState } from "../utils/oauthState";
import { logger } from "../config/logger";


/**
 * Google va Discord callback'lari bir xil ishlaydi, farqi faqat strategiya
 * nomida. Oqim: `state` tekshiriladi → foydalanuvchi topiladi → bir martalik
 * kod beriladi va saytga shu kod bilan qaytariladi (tokenlar URL'ga
 * qo'yilmaydi).
 */
function oauthCallback(strategy: "google" | "discord", genericError: string) {
  return (req: Request, res: Response, next: () => void) => {
    const fail = (msg: string) =>
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(msg)}`);

    // CSRF: state cookie'dagi qiymatga mos kelmasa, oqim boshqa joydan boshlangan.
    if (!verifyState(req, res)) {
      logger.warn(`OAuth (${strategy}): state mos kelmadi — so'rov rad etildi`);
      return fail("Kirish so'rovi tasdiqlanmadi. Qaytadan urinib ko'ring.");
    }

    passport.authenticate(
      strategy,
      { session: false },
      async (err: unknown, user: PrismaUser | false) => {
        if (err || !user) {
          return fail(err instanceof Error ? err.message : genericError);
        }
        try {
          const code = await authCodeService.issue(user);
          return res.redirect(`${frontendUrl}/auth/callback?code=${code}`);
        } catch (e) {
          return fail(e instanceof Error ? e.message : "Kirish yakunlanmadi");
        }
      }
    )(req, res, next);
  };
}

export const authController = {
  config: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, {
      telegramBotUsername: isTelegramConfigured ? env.TELEGRAM_BOT_USERNAME : null,
      frontendUrl,
    });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    return ok(res, result, "Muvaffaqiyatli kirildi");
  }),

  telegramLogin: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.telegramLogin(req.body);
    return ok(res, result, "Telegram orqali muvaffaqiyatli kirildi");
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.refresh(req.body.refreshToken);
    return ok(res, result, "Token yangilandi");
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.body?.refreshToken);
    return ok(res, null, "Tizimdan chiqildi");
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const user = await authService.me(req.user.id);
    return ok(res, user);
  }),

  googleStart: (req: Request, res: Response, next: () => void) => {
    if (!isGoogleConfigured) throw AppError.badRequest("Google OAuth sozlanmagan");
    const state = createState(res);
    passport.authenticate("google", { session: false, state })(req, res, next);
  },

  googleCallback: (req: Request, res: Response, next: () => void) => {
    oauthCallback("google", "Google kirish xatosi")(req, res, next);
  },

  discordStart: (req: Request, res: Response, next: () => void) => {
    if (!isDiscordConfigured) throw AppError.badRequest("Discord OAuth sozlanmagan");
    const state = createState(res);
    passport.authenticate("discord", { session: false, state })(req, res, next);
  },

  discordCallback: (req: Request, res: Response, next: () => void) => {
    oauthCallback("discord", "Discord kirish xatosi")(req, res, next);
  },

  /** OAuth'dan kelgan bir martalik kodni tokenlarga almashtiradi. */
  exchange: asyncHandler(async (req: Request, res: Response) => {
    const code = typeof req.body?.code === "string" ? req.body.code : "";
    const result = await authCodeService.exchange(code);
    return ok(res, result, "Kirish muvaffaqiyatli");
  }),
};
