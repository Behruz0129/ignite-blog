/**
 * AUTH SERVICE
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
import { generateSecureToken, tokenExpiryHours } from "../utils/secureToken";
import { LoginInput, RegisterInput } from "../validators/auth.validator";
import { emailService } from "./email.service";
import {
  verifyTelegramAuth,
  sendTelegramMessage,
  type TelegramAuthData,
} from "./telegram.service";
import { env } from "../config/env";
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
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw AppError.badRequest("Bu email allaqachon ro'yxatdan o'tgan");
    }

    const verificationToken = generateSecureToken();
    const hashed = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashed,
        role: "USER",
        provider: "LOCAL",
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: tokenExpiryHours(24),
      },
    });

    try {
      await emailService.sendVerification(user.email, user.name, verificationToken);
    } catch (err) {
      // Email ketmasa user qolmasin — o'chiramiz va xatoni qaytaramiz
      await prisma.user.delete({ where: { id: user.id } });
      throw err;
    }

    return {
      message:
        "Ro'yxatdan o'tdingiz! Emailingizga tasdiqlash havolasi yuborildi. Emailni tasdiqlang, so'ng kiring.",
      email: user.email,
    };
  },

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

  async verifyEmail(token: string) {
    if (!token) throw AppError.badRequest("Token topilmadi");

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw AppError.badRequest("Token yaroqsiz yoki muddati tugagan");
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return issueTokens(updated);
  },

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: "Agar email ro'yxatdan o'tgan bo'lsa, tasdiqlash xabari yuborildi" };
    }
    if (user.emailVerified) {
      throw AppError.badRequest("Email allaqachon tasdiqlangan");
    }
    if (user.provider !== "LOCAL") {
      throw AppError.badRequest("Bu akkaunt email tasdiqlashni talab qilmaydi");
    }

    const verificationToken = generateSecureToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: tokenExpiryHours(24),
      },
    });

    await emailService.sendVerification(user.email, user.name, verificationToken);
    return { message: "Tasdiqlash xabari qayta yuborildi" };
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    const genericMsg =
      "Agar email ro'yxatdan o'tgan bo'lsa, parol tiklash yo'riqnomasi yuborildi";

    if (!user || !user.password) {
      return { message: genericMsg };
    }

    const resetToken = generateSecureToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: tokenExpiryHours(1),
      },
    });

    await emailService.sendPasswordReset(user.email, user.name, resetToken);

    // Telegram bog'langan bo'lsa — bot orqali ham yuboramiz
    if (user.telegramId) {
      const link = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendTelegramMessage(
        user.telegramId,
        `🔐 <b>Parolni tiklash</b>\n\nSalom, ${user.name}!\n\n<a href="${link}">Parolni tiklash</a>\n\nHavola 1 soat amal qiladi.`
      );
    }

    return { message: genericMsg };
  },

  async resetPassword(token: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw AppError.badRequest("Token yaroqsiz yoki muddati tugagan");
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Barcha refresh token'larni bekor qilamiz
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: "Parol muvaffaqiyatli yangilandi. Endi yangi parol bilan kiring." };
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

    if (!record || record.revokedAt || record.expiresAt < new Date()) {
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
