/**
 * LIKE SERVICE
 * ------------
 * Ro'yxatdan o'tgan foydalanuvchi maqolaga like bosadi/oladi (toggle).
 *
 * Ilgari uchta alohida havola maydoni bor edi (newsId/guideId/opinionId) va
 * har amalda qaysi biri to'ldirilganini aniqlash kerak bo'lardi. Kontent
 * bitta jadvalga birlashgach, `postId` yetarli.
 */

import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

export const likeService = {
  async toggle(userId: string, postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) throw AppError.notFound("Maqola topilmadi");

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return { liked: false, likeCount: await this.count(postId) };
    }

    await prisma.like.create({ data: { userId, postId } });
    return { liked: true, likeCount: await this.count(postId) };
  },

  async count(postId: string) {
    return prisma.like.count({ where: { postId } });
  },

  async likedByUser(userId: string, postId: string) {
    const found = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
      select: { id: true },
    });
    return Boolean(found);
  },
};
