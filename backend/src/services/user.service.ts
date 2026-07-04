/**
 * USER SERVICE (SUPER_ADMIN)
 * --------------------------
 * Foydalanuvchilarni boshqarish: ro'yxat, yordamchi admin yaratish,
 * rol o'zgartirish, parol tiklash, o'chirish.
 */

import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { getPagination, buildMeta } from "../utils/pagination";

export const userService = {
  async list(opts: {
    page?: number;
    limit?: number;
    search?: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "USER";
  }) {
    const { page, limit, skip } = getPagination(opts as Record<string, unknown>);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (opts.role) where.role = opts.role;
    if (opts.search) {
      where.OR = [
        { name: { contains: opts.search, mode: "insensitive" } },
        { email: { contains: opts.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          provider: true,
          avatar: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, meta: buildMeta(total, page, limit) };
  },

  async create(input: {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "USER";
  }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw AppError.badRequest("Bu email allaqachon ro'yxatdan o'tgan");

    const hashed = await bcrypt.hash(input.password, 10);
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashed,
        role: input.role,
        provider: "LOCAL",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: true,
        createdAt: true,
      },
    });
  },

  async updateRole(id: string, role: "SUPER_ADMIN" | "ADMIN" | "USER", actorId: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound("Foydalanuvchi topilmadi");

    // O'z rolini o'zgartirishga yo'l qo'ymaymiz
    if (id === actorId) {
      throw AppError.badRequest("O'z rolingizni o'zgartira olmaysiz");
    }

    return prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: true,
        createdAt: true,
      },
    });
  },

  async resetPassword(id: string, password: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound("Foydalanuvchi topilmadi");

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashed },
    });
    // Barcha refresh token'larni bekor qilamiz
    await prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { id };
  },

  async remove(id: string, actorId: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound("Foydalanuvchi topilmadi");

    if (id === actorId) {
      throw AppError.badRequest("O'zingizni o'chira olmaysiz");
    }
    if (user.role === "SUPER_ADMIN") {
      throw AppError.badRequest("Asosiy adminni o'chirib bo'lmaydi");
    }

    await prisma.user.delete({ where: { id } });
    return { id };
  },
};
