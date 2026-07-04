/**
 * COMMENT SERVICE
 */

import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { getPagination, buildMeta } from "../utils/pagination";

interface CreateCommentInput {
  authorName?: string;
  authorEmail?: string;
  content: string;
  newsId?: string;
  guideId?: string;
  opinionId?: string;
  userId?: string;
}

export const commentService = {
  async create(input: CreateCommentInput) {
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

    // Ro'yxatdan o'tgan user: avtomatik APPROVED
    if (input.userId) {
      const user = await prisma.user.findUnique({ where: { id: input.userId } });
      if (!user) throw AppError.unauthorized();

      return prisma.comment.create({
        data: {
          content: input.content,
          userId: user.id,
          authorName: user.name,
          authorEmail: user.email,
          newsId: input.newsId ?? null,
          guideId: input.guideId ?? null,
          opinionId: input.opinionId ?? null,
          status: "APPROVED",
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      });
    }

    // Ghost (mehmon): ism+email majburiy, PENDING
    if (!input.authorName || !input.authorEmail) {
      throw AppError.badRequest("Mehmon sifatida izoh qoldirish uchun ism va email kerak");
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
          user: { select: { id: true, name: true, avatar: true } },
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

  async remove(id: string, actorId?: string, actorRole?: string) {
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound("Izoh topilmadi");

    // Oddiy user faqat o'z izohini o'chira oladi
    if (actorRole === "USER" && existing.userId !== actorId) {
      throw AppError.forbidden("Faqat o'z izohingizni o'chira olasiz");
    }

    await prisma.comment.delete({ where: { id } });
    return { id };
  },
};
