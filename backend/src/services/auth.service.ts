/**
 * AUTH SERVICE
 * ------------
 * Login logikasi: email bo'yicha foydalanuvchini topadi, parolni bcrypt bilan
 * solishtiradi va to'g'ri bo'lsa JWT token qaytaradi.
 *
 * Eslatma: "logout" odatda serverda hech narsa qilmaydi - token JWT bo'lgani
 * uchun client uni o'chiradi (localStorage'dan). Shuning uchun bu yerda
 * faqat login va "me" (joriy foydalanuvchi) bor.
 */

import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { signToken } from "../utils/token";
import { LoginInput } from "../validators/auth.validator";

export const authService = {
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    // Xavfsizlik: foydalanuvchi topilmadi yoki parol noto'g'ri - bir xil xabar
    // (hujumchiga email mavjudligini oshkor qilmaymiz)
    if (!user) {
      throw AppError.unauthorized("Email yoki parol noto'g'ri");
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw AppError.unauthorized("Email yoki parol noto'g'ri");
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) throw AppError.notFound("Foydalanuvchi topilmadi");
    return user;
  },
};
