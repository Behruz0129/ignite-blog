/**
 * AUTH CONTROLLER
 */

import { Request, Response } from "express";
import passport from "passport";
import { asyncHandler } from "../utils/asyncHandler";
import { authService } from "../services/auth.service";
import { ok, created } from "../utils/apiResponse";
import { AppError } from "../utils/AppError";
import {
  env,
  isGoogleConfigured,
  isDiscordConfigured,
  isTelegramConfigured,
} from "../config/env";
import type { User as PrismaUser } from "@prisma/client";

export const authController = {
  config: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, {
      telegramBotUsername: isTelegramConfigured ? env.TELEGRAM_BOT_USERNAME : null,
    });
  }),

  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    return created(res, result, result.message);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    return ok(res, result, "Muvaffaqiyatli kirildi");
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.verifyEmail(req.body.token);
    return ok(res, result, "Email tasdiqlandi");
  }),

  resendVerification: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.resendVerification(req.body.email);
    return ok(res, result, result.message);
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req.body.email);
    return ok(res, result, result.message);
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    return ok(res, result, result.message);
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
    passport.authenticate("google", { session: false })(req, res, next);
  },

  googleCallback: (req: Request, res: Response, next: () => void) => {
    passport.authenticate("google", { session: false }, async (err: unknown, user: PrismaUser | false) => {
      if (err || !user) {
        const msg = err instanceof Error ? err.message : "Google kirish xatosi";
        return res.redirect(`${env.FRONTEND_URL}/auth/callback?error=${encodeURIComponent(msg)}`);
      }
      try {
        const tokens = await authService.issueTokens(user);
        const params = new URLSearchParams({
          token: tokens.token,
          refreshToken: tokens.refreshToken,
        });
        return res.redirect(`${env.FRONTEND_URL}/auth/callback?${params.toString()}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Token yaratish xatosi";
        return res.redirect(`${env.FRONTEND_URL}/auth/callback?error=${encodeURIComponent(msg)}`);
      }
    })(req, res, next);
  },

  discordStart: (req: Request, res: Response, next: () => void) => {
    if (!isDiscordConfigured) throw AppError.badRequest("Discord OAuth sozlanmagan");
    passport.authenticate("discord", { session: false })(req, res, next);
  },

  discordCallback: (req: Request, res: Response, next: () => void) => {
    passport.authenticate("discord", { session: false }, async (err: unknown, user: PrismaUser | false) => {
      if (err || !user) {
        const msg = err instanceof Error ? err.message : "Discord kirish xatosi";
        return res.redirect(`${env.FRONTEND_URL}/auth/callback?error=${encodeURIComponent(msg)}`);
      }
      try {
        const tokens = await authService.issueTokens(user);
        const params = new URLSearchParams({
          token: tokens.token,
          refreshToken: tokens.refreshToken,
        });
        return res.redirect(`${env.FRONTEND_URL}/auth/callback?${params.toString()}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Token yaratish xatosi";
        return res.redirect(`${env.FRONTEND_URL}/auth/callback?error=${encodeURIComponent(msg)}`);
      }
    })(req, res, next);
  },
};
