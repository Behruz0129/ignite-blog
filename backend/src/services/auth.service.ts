/**
 * AUTH SERVICE
 * ------------
 * Kirish yo'llari: Telegram Login Widget, Google/Discord OAuth (sozlansa) va
 * email+parol (faqat seed orqali yaratilgan adminlar uchun).
 *
 * Email bilan RO'YXATDAN O'TISH ataylab olib tashlangan: auditoriya
 * Telegram'da, bir bosishda kirish qulayroq, va email tasdiqlash uchun
 * tashqi xizmat (Resend) saqlab turish shart emas. Shu sababli email
 * tasdiqlash va parol tiklash oqimlari ham yo'q.
 */

import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import {
  signToken,
  generateRefreshToken,
  hashToken,
  refreshTokenExpiry,
} from "../utils/token";
import { LoginInput } from "../validators/auth.validator";
import { verifyTelegramAuth, type TelegramAuthData } from "./telegram.service";
import { logger } from "../config/logger";
import type { User } from "@prisma/client";

function publicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    provider: user.provider,
    emailVerified: user.emailVerified,
  };
}

async function issueTokens(user: User) {
  const accessToken = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken();
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: refreshTokenExpiry(),
    },
  });

  return { token: accessToken, refreshToken, user: publicUser(user) };
}

export const authService = {
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw AppError.unauthorized("Email yoki parol noto'g'ri");
    }

    if (!user.password) {
      throw AppError.badRequest(
        "Bu akkaunt Telegram yoki ijtimoiy tarmoq orqali ochilgan. Mos usul bilan kiring."
      );
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw AppError.unauthorized("Email yoki parol noto'g'ri");
    }

    if (user.provider === "LOCAL" && !user.emailVerified) {
      throw AppError.forbidden(
        "Email tasdiqlanmagan. Pochtangizdagi havolani bosing yoki qayta yuborishni so'rang."
      );
    }

    return issueTokens(user);
  },

  async telegramLogin(data: TelegramAuthData) {
    verifyTelegramAuth(data);

    const telegramId = String(data.id);
    const name = [data.first_name, data.last_name].filter(Boolean).join(" ");

    let user = await prisma.user.findFirst({ where: { telegramId } });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          avatar: data.photo_url ?? user.avatar,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: name || data.username || "Telegram foydalanuvchi",
          email: `telegram_${telegramId}@noemail.ignite`,
          role: "USER",
          provider: "TELEGRAM",
          telegramId,
          avatar: data.photo_url ?? null,
          emailVerified: true,
        },
      });
    }

    return issueTokens(user);
  },

  async refresh(refreshToken: string) {
    if (!refreshToken) throw AppError.unauthorized("Refresh token topilmadi");

    const record = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
      include: { user: true },
    });

    if (!record) {
      throw AppError.unauthorized("Refresh token yaroqsiz yoki muddati tugagan");
    }

    /**
     * Allaqachon ishlatilgan (bekor qilingan) token qayta kelsa — bu o'g'rilik
     * belgisi: rotatsiyadan keyin haqiqiy foydalanuvchi yangi tokenga o'tgan,
     * eskisi esa faqat uni ushlab olgan tomonda qoladi. Kim birinchi
     * kelganini bilib bo'lmagani uchun eng xavfsiz yo'l — shu foydalanuvchining
     * BARCHA sessiyalarini yopish va qayta kirishga majburlash.
     */
    if (record.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      logger.warn(
        `Refresh token qayta ishlatildi (userId=${record.userId}) — barcha sessiyalar yopildi`
      );
      throw AppError.unauthorized(
        "Sessiya xavfsizlik sababli yopildi. Iltimos, qaytadan kiring."
      );
    }

    if (record.expiresAt < new Date()) {
      throw AppError.unauthorized("Refresh token yaroqsiz yoki muddati tugagan");
    }

    await prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    return issueTokens(record.user);
  },

  async logout(refreshToken?: string) {
    if (!refreshToken) return { ok: true };
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  },

  async oauthUpsert(params: {
    provider: "GOOGLE" | "DISCORD";
    providerId: string;
    email?: string | null;
    name: string;
    avatar?: string | null;
  }): Promise<User> {
    const providerField = params.provider === "GOOGLE" ? "googleId" : "discordId";

    let user = await prisma.user.findFirst({
      where: { [providerField]: params.providerId },
    });
    if (user) return user;

    if (params.email) {
      user = await prisma.user.findUnique({ where: { email: params.email } });
      if (user) {
        return prisma.user.update({
          where: { id: user.id },
          data: {
            [providerField]: params.providerId,
            avatar: user.avatar ?? params.avatar ?? null,
            emailVerified: true,
          },
        });
      }
    }

    const email =
      params.email ??
      `${params.provider.toLowerCase()}_${params.providerId}@noemail.ignite`;

    return prisma.user.create({
      data: {
        name: params.name,
        email,
        role: "USER",
        provider: params.provider,
        avatar: params.avatar ?? null,
        [providerField]: params.providerId,
        emailVerified: true,
      },
    });
  },

  issueTokens,

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        provider: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    if (!user) throw AppError.notFound("Foydalanuvchi topilmadi");
    return user;
  },
};
