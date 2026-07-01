/**
 * COMMENT SERVICE
 * ---------------
 * - create: public foydalanuvchi izoh qoldiradi (avtomatik PENDING holatda).
 * - list: admin barcha izohlarni ko'radi (holat bo'yicha filter).
 * - updateStatus: APPROVED / REJECTED / PENDING.
 * - remove: o'chirish.
 */

import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { getPagination, buildMeta } from "../utils/pagination";

interface CreateCommentInput {
  authorName: string;
  authorEmail: string;
  content: string;
  newsId?: string;
  guideId?: string;
  opinionId?: string;
}

export const commentService = {
  async create(input: CreateCommentInput) {
    // Bog'langan kontent haqiqatan mavjudligini tekshiramiz
    if (input.newsId) {
      const exists = await prisma.news.findUnique({ where: { id: input.newsId } });
      if (!exists) throw AppError.notFound("Yangilik topilmadi");
    } else if (input.guideId) {
      const exists = await prisma.guide.findUnique({ where: { id: input.guideId } });
      if (!exists) throw AppError.notFound("Qo'llanma topilmadi");
    } else if (input.opinionId) {
      const exists = await prisma.opinion.findUnique({ where: { id: input.opinionId } });
      if (!exists) throw AppError.notFound("Maqola topilmadi");
    }

    return prisma.comment.create({
      data: {
        authorName: input.authorName,
        authorEmail: input.authorEmail,
        content: input.content,
        newsId: input.newsId ?? null,
        guideId: input.guideId ?? null,
        opinionId: input.opinionId ?? null,
        status: "PENDING",
      },
    });
  },

  async list(opts: {
    page?: number;
    limit?: number;
    status?: "PENDING" | "APPROVED" | "REJECTED";
    search?: string;
  }) {
    const { page, limit, skip } = getPagination(opts as Record<string, unknown>);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (opts.status) where.status = opts.status;
    if (opts.search) {
      where.OR = [
        { authorName: { contains: opts.search, mode: "insensitive" } },
        { authorEmail: { contains: opts.search, mode: "insensitive" } },
        { content: { contains: opts.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          news: { select: { id: true, title: true, slug: true } },
          guide: { select: { id: true, title: true, slug: true } },
          opinion: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return { items, meta: buildMeta(total, page, limit) };
  },

  async updateStatus(id: string, status: "PENDING" | "APPROVED" | "REJECTED") {
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound("Izoh topilmadi");
    return prisma.comment.update({ where: { id }, data: { status } });
  },

  async remove(id: string) {
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound("Izoh topilmadi");
    await prisma.comment.delete({ where: { id } });
    return { id };
  },
};
