/**
 * AUTH SERVICE
 * ------------
 * - register: email+parol bilan yangi USER yaratadi.
 * - login: email+parol tekshiradi.
 * - issueTokens: access + refresh token yaratadi (refresh DB'ga hash bilan saqlanadi).
 * - refresh: refresh token'ni tekshiradi, rotatsiya qiladi (eski bekor, yangi beriladi).
 * - logout: refresh token'ni bekor qiladi.
 * - oauthUpsert: Google/Discord'dan kelgan profil bo'yicha user topadi yoki yaratadi.
 * - me: joriy foydalanuvchi ma'lumoti.
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
import { LoginInput, RegisterInput } from "../validators/auth.validator";
import type { User } from "@prisma/client";

function publicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    provider: user.provider,
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

    const hashed = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashed,
        role: "USER",
        provider: "LOCAL",
      },
    });

    return issueTokens(user);
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    // Xavfsizlik: bir xil xabar (email mavjudligini oshkor qilmaymiz)
    if (!user) {
      throw AppError.unauthorized("Email yoki parol noto'g'ri");
    }

    // OAuth orqali ochilgan akkauntda parol bo'lmasligi mumkin
    if (!user.password) {
      throw AppError.badRequest(
        "Bu akkaunt ijtimoiy tarmoq orqali ochilgan. Google yoki Discord bilan kiring."
      );
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw AppError.unauthorized("Email yoki parol noto'g'ri");
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

    // Rotatsiya: eski token'ni bekor qilamiz, yangisini beramiz
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

  /**
   * OAuth: provider ID yoki email bo'yicha user topadi, bo'lmasa yaratadi.
   * Tokens controller tomonida beriladi (redirect uchun).
   */
  async oauthUpsert(params: {
    provider: "GOOGLE" | "DISCORD";
    providerId: string;
    email?: string | null;
    name: string;
    avatar?: string | null;
  }): Promise<User> {
    const providerField = params.provider === "GOOGLE" ? "googleId" : "discordId";

    // 1) Provider ID bo'yicha
    let user = await prisma.user.findFirst({
      where: { [providerField]: params.providerId },
    });
    if (user) return user;

    // 2) Email bo'yicha (mavjud akkauntga provider ID'ni bog'laymiz)
    if (params.email) {
      user = await prisma.user.findUnique({ where: { email: params.email } });
      if (user) {
        return prisma.user.update({
          where: { id: user.id },
          data: {
            [providerField]: params.providerId,
            avatar: user.avatar ?? params.avatar ?? null,
          },
        });
      }
    }

    // 3) Yangi user (email bo'lmasa sun'iy noyob email yasaymiz)
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
      },
    });
  },

  // OAuth callback'da tokenlar berish uchun ochiq yordamchi
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
        createdAt: true,
      },
    });
    if (!user) throw AppError.notFound("Foydalanuvchi topilmadi");
    return user;
  },
};
