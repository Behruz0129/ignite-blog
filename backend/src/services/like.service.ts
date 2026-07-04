/**
 * LIKE SERVICE
 * ------------
 * Ro'yxatdan o'tgan foydalanuvchi kontentga like bosadi/oladi (toggle).
 */

import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

interface ToggleInput {
  userId: string;
  newsId?: string;
  guideId?: string;
  opinionId?: string;
}

export const likeService = {
  async toggle(input: ToggleInput) {
    const { userId, newsId, guideId, opinionId } = input;

    // Kontent mavjudligini tekshiramiz
    if (newsId) {
      const exists = await prisma.news.findUnique({ where: { id: newsId } });
      if (!exists) throw AppError.notFound("Yangilik topilmadi");
    } else if (guideId) {
      const exists = await prisma.guide.findUnique({ where: { id: guideId } });
      if (!exists) throw AppError.notFound("Qo'llanma topilmadi");
    } else if (opinionId) {
      const exists = await prisma.opinion.findUnique({ where: { id: opinionId } });
      if (!exists) throw AppError.notFound("Maqola topilmadi");
    }

    const where = newsId
      ? { userId_newsId: { userId, newsId } }
      : guideId
        ? { userId_guideId: { userId, guideId } }
        : { userId_opinionId: { userId, opinionId: opinionId! } };

    const existing = await prisma.like.findUnique({ where });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await this.count({ newsId, guideId, opinionId });
      return { liked: false, likeCount: count };
    }

    await prisma.like.create({
      data: {
        userId,
        newsId: newsId ?? null,
        guideId: guideId ?? null,
        opinionId: opinionId ?? null,
      },
    });

    const count = await this.count({ newsId, guideId, opinionId });
    return { liked: true, likeCount: count };
  },

  async count(params: { newsId?: string; guideId?: string; opinionId?: string }) {
    const { newsId, guideId, opinionId } = params;
    if (newsId) return prisma.like.count({ where: { newsId } });
    if (guideId) return prisma.like.count({ where: { guideId } });
    if (opinionId) return prisma.like.count({ where: { opinionId } });
    return 0;
  },

  async likedByUser(userId: string, params: { newsId?: string; guideId?: string; opinionId?: string }) {
    const { newsId, guideId, opinionId } = params;
    const where = newsId
      ? { userId, newsId }
      : guideId
        ? { userId, guideId }
        : { userId, opinionId };
    const found = await prisma.like.findFirst({ where });
    return Boolean(found);
  },
};
