/**
 * POST SERVICE
 * ------------
 * Yangiliklar, qo'llanmalar va maqolalar bitta `posts` jadvalida yashaydi,
 * farq faqat `type` maydonida. Ilgari uchta alohida jadval va ular uchun
 * uch nusxa kod bor edi.
 *
 * `type` ixtiyoriy: berilmasa uchala tur aralash qaytadi — saytdagi "Barchasi"
 * oqimi va adminkadagi umumiy ro'yxat shunga tayanadi.
 */

import type { PostType } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { telegramPostService } from "./telegramPost.service";
import { slugify, generateUniqueSlug } from "../utils/slugify";
import { calcReadingMinutes } from "../utils/readingTime";
import { sanitizeContent } from "../utils/sanitizeContent";
import { getPagination, buildMeta } from "../utils/pagination";

/** Detal sahifada bir yo'la yuboriladigan izohlar soni (qolganlari — keyin) */
const COMMENTS_LIMIT = 50;

export interface ListOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  status?: "DRAFT" | "PUBLISHED";
  category?: string;
  tag?: string;
  type?: PostType;
  onlyPublished?: boolean;
  userId?: string; // auth bo'lsa likedByMe uchun
}

export interface PostInput {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  featuredImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  status?: "DRAFT" | "PUBLISHED";
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"; // faqat GUIDE
  categoryIds?: string[];
  tagIds?: string[];
}

const includeRelations = {
  categories: { select: { id: true, name: true, slug: true } },
  tags: { select: { id: true, name: true, slug: true } },
  author: { select: { id: true, name: true, email: true } },
  _count: { select: { comments: true, likes: true } },
};

/**
 * RO'YXAT uchun maydonlar.
 *
 * Diqqat: bu yerda ataylab `select` ishlatiladi, `include` emas. `include`
 * bilan Prisma BARCHA skalyar maydonlarni qaytaradi — shu jumladan `content`,
 * ya'ni maqolaning to'liq HTML matni. Bosh sahifa o'nlab element so'raganda
 * bu yuzlab kilobayt keraksiz trafik demakdir (ro'yxatda matn ko'rsatilmaydi).
 * `content` faqat bitta yozuv so'ralganda qaytariladi.
 */
const listSelect = {
  id: true,
  type: true,
  title: true,
  slug: true,
  excerpt: true,
  featuredImage: true,
  metaTitle: true,
  metaDescription: true,
  status: true,
  publishedAt: true,
  difficulty: true,
  readingMinutes: true,
  createdAt: true,
  updatedAt: true,
  authorId: true,
  ...includeRelations,
};

/** Slug tur ichida band-bandligini tekshiradi. */
async function slugExists(type: PostType, slug: string, excludeId?: string) {
  const found = await prisma.post.findUnique({
    where: { type_slug: { type, slug } },
    select: { id: true },
  });
  if (!found) return false;
  if (excludeId && found.id === excludeId) return false;
  return true;
}

/** Ro'yxatga "men like bosganmi" belgisini qo'shadi. */
async function enrichLikedByMe<T extends { id: string }>(
  items: T[],
  userId?: string
): Promise<(T & { likedByMe?: boolean })[]> {
  if (!userId || items.length === 0) return items;

  const likes = await prisma.like.findMany({
    where: { userId, postId: { in: items.map((i) => i.id) } },
    select: { postId: true },
  });

  const liked = new Set(likes.map((l) => l.postId));
  return items.map((item) => ({ ...item, likedByMe: liked.has(item.id) }));
}

export const postService = {
  /** Ro'yxat: qidiruv + filter + sort + sahifalash. */
  async list(opts: ListOptions) {
    const { page, limit, skip } = getPagination(opts as Record<string, unknown>);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Tur berilmasa uchala tur aralash qaytadi.
    if (opts.type) where.type = opts.type;

    if (opts.onlyPublished) {
      where.status = "PUBLISHED";
      where.publishedAt = { lte: new Date() };
    } else if (opts.status) {
      where.status = opts.status;
    }

    if (opts.search) {
      where.OR = [
        { title: { contains: opts.search, mode: "insensitive" } },
        { excerpt: { contains: opts.search, mode: "insensitive" } },
      ];
    }

    if (opts.category) where.categories = { some: { slug: opts.category } };
    if (opts.tag) where.tags = { some: { slug: opts.tag } };

    const allowedSort = ["createdAt", "updatedAt", "publishedAt", "title"];
    const sortField = allowedSort.includes(opts.sort || "")
      ? (opts.sort as string)
      : "createdAt";
    const order = opts.order === "asc" ? "asc" : "desc";

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: listSelect,
        orderBy: { [sortField]: order },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    const enriched = await enrichLikedByMe(items, opts.userId);
    return { items: enriched, meta: buildMeta(total, page, limit) };
  },

  /** Slug bo'yicha bitta yozuv (public sayt uchun). */
  async getBySlug(
    type: PostType,
    slug: string,
    onlyPublished = false,
    userId?: string
  ) {
    const item = await prisma.post.findUnique({
      where: { type_slug: { type, slug } },
      include: {
        ...includeRelations,
        // Diqqat: `take` MAJBURIY. Limitsiz qolsa ommalashgan maqolaning
        // barcha izohlari bitta javobga tiqiladi. Eng so'nggi N ta yetarli;
        // umumiy son alohida `commentCount` sifatida qaytariladi.
        comments: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take: COMMENTS_LIMIT,
          select: {
            id: true,
            authorName: true,
            content: true,
            createdAt: true,
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    if (!item) throw AppError.notFound("Kontent topilmadi");
    if (onlyPublished && item.status !== "PUBLISHED") {
      throw AppError.notFound("Kontent topilmadi");
    }

    // Tasdiqlangan izohlarning UMUMIY soni. `_count.comments` bu yerda
    // yaramaydi — u moderatsiyadan o'tmaganlarni ham sanaydi.
    const commentCount = await prisma.comment.count({
      where: { status: "APPROVED", postId: item.id },
    });

    let likedByMe = false;
    if (userId) {
      likedByMe = Boolean(
        await prisma.like.findUnique({
          where: { userId_postId: { userId, postId: item.id } },
          select: { id: true },
        })
      );
    }

    return { ...item, commentCount, likedByMe };
  },

  /** ID bo'yicha bitta yozuv (admin tahrirlash uchun). */
  async getById(id: string) {
    const item = await prisma.post.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!item) throw AppError.notFound("Kontent topilmadi");
    return item;
  },

  /** Yangi yozuv yaratish. */
  async create(type: PostType, input: PostInput, authorId?: string) {
    if (!input.title) throw AppError.badRequest("Sarlavha majburiy");

    const baseSlug = slugify(input.slug || input.title);
    const slug = await generateUniqueSlug(baseSlug, (s) => slugExists(type, s));

    // HTML saqlashdan OLDIN tozalanadi — bazadagi matn to'g'ridan-to'g'ri
    // public saytda dangerouslySetInnerHTML orqali chiziladi.
    const content = sanitizeContent(input.content ?? "");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      type,
      title: input.title,
      slug,
      excerpt: input.excerpt ?? null,
      content,
      featuredImage: input.featuredImage ?? null,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
      status: input.status ?? "DRAFT",
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      readingMinutes: calcReadingMinutes(content),
      // Murakkablik faqat qo'llanmalarda ma'noga ega.
      difficulty: type === "GUIDE" ? (input.difficulty ?? "BEGINNER") : null,
    };

    if (authorId) data.author = { connect: { id: authorId } };
    if (input.categoryIds?.length) {
      data.categories = { connect: input.categoryIds.map((id) => ({ id })) };
    }
    if (input.tagIds?.length) {
      data.tags = { connect: input.tagIds.map((id) => ({ id })) };
    }

    const record = await prisma.post.create({ data, include: includeRelations });

    // Darhol chop etilgan bo'lsa — kanalga e'lon. Javob kutilmaydi:
    // Telegram sekin bo'lsa ham adminka darrov javob qaytarsin.
    if (record.status === "PUBLISHED") {
      void telegramPostService.publish(record);
    }

    return record;
  },

  /** Mavjud yozuvni yangilash. */
  async update(id: string, input: PostInput) {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound("Kontent topilmadi");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.excerpt !== undefined) data.excerpt = input.excerpt;
    if (input.featuredImage !== undefined) data.featuredImage = input.featuredImage;
    if (input.metaTitle !== undefined) data.metaTitle = input.metaTitle;
    if (input.metaDescription !== undefined) data.metaDescription = input.metaDescription;

    if (input.content !== undefined) {
      data.content = sanitizeContent(input.content);
      data.readingMinutes = calcReadingMinutes(data.content);
    }

    if (input.slug !== undefined && input.slug !== existing.slug) {
      const base = slugify(input.slug || input.title || existing.title);
      data.slug = await generateUniqueSlug(base, (s) =>
        slugExists(existing.type, s, id)
      );
    }

    if (input.status !== undefined) {
      data.status = input.status;
      if (input.status === "PUBLISHED" && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
      if (input.status === "DRAFT") data.publishedAt = null;
    }

    if (existing.type === "GUIDE" && input.difficulty !== undefined) {
      data.difficulty = input.difficulty;
    }

    if (input.categoryIds) data.categories = { set: input.categoryIds.map((id) => ({ id })) };
    if (input.tagIds) data.tags = { set: input.tagIds.map((id) => ({ id })) };

    const updated = await prisma.post.update({
      where: { id },
      data,
      include: includeRelations,
    });

    // Qoralamadan chop etilganga o'tgan bo'lsa — kanalga e'lon.
    // Takroriy xabar `telegramPostedAt` orqali servis ichida to'siladi.
    if (updated.status === "PUBLISHED") {
      void telegramPostService.publish(updated);
    }

    return updated;
  },

  /** Yozuvni o'chirish. */
  async remove(id: string) {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound("Kontent topilmadi");
    await prisma.post.delete({ where: { id } });
    return { ok: true };
  },

  /** Tezkor holat o'zgartirish (publish/draft). */
  async setStatus(id: string, status: "DRAFT" | "PUBLISHED") {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound("Kontent topilmadi");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { status };
    if (status === "PUBLISHED" && !existing.publishedAt) {
      data.publishedAt = new Date();
    }
    if (status === "DRAFT") data.publishedAt = null;

    const updated = await prisma.post.update({
      where: { id },
      data,
      include: includeRelations,
    });

    if (status === "PUBLISHED") {
      void telegramPostService.publish(updated);
    }

    return updated;
  },
};
