/**
 * OAUTH ALMASHUV KODI
 * -------------------
 * OAuth'dan qaytishda tokenlarni to'g'ridan-to'g'ri redirect URL'iga qo'yish
 * xavfli: URL brauzer tarixida qoladi, `Referer` sarlavhasi orqali begona
 * saytga sizishi va server/proksi loglariga tushishi mumkin. Refresh token
 * esa uzoq muddatli — bir marta sizsa, akkaunt uzoq vaqt ochiq qoladi.
 *
 * Shuning uchun URL'da faqat qisqa muddatli, bir martalik kod ketadi.
 * Mijoz uni POST orqali tokenlarga almashtiradi va kod shu zahoti kuyadi.
 */

import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { generateSecureToken, hashToken } from "../utils/secureToken";
import { authService } from "./auth.service";
import type { User } from "@prisma/client";

/** Kod juda qisqa yashaydi: u faqat brauzer redirectiga yetsa bas. */
const CODE_TTL_MS = 60 * 1000;

export const authCodeService = {
  /** Foydalanuvchi uchun bir martalik kod yaratadi. */
  async issue(user: User): Promise<string> {
    const code = generateSecureToken();

    await prisma.authCode.create({
      data: {
        codeHash: hashToken(code),
        userId: user.id,
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    });

    return code;
  },

  /** Kodni tokenlarga almashtiradi. Kod bir marta ishlaydi. */
  async exchange(code: string) {
    if (!code) throw AppError.badRequest("Kod topilmadi");

    const record = await prisma.authCode.findUnique({
      where: { codeHash: hashToken(code) },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw AppError.unauthorized("Kod yaroqsiz yoki muddati tugagan");
    }

    // Avval kuydiramiz, keyin token beramiz: ikki so'rov bir vaqtda kelsa ham
    // faqat bittasi o'tadi.
    await prisma.authCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return authService.issueTokens(record.user);
  },

  /** Muddati o'tgan kodlarni tozalaydi (vaqti-vaqti bilan chaqiriladi). */
  async purgeExpired(): Promise<number> {
    const { count } = await prisma.authCode.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return count;
  },
};
