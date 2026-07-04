/**
 * CONTENT SERVICE (factory)
 * -------------------------
 * News, Guides va Opinions deyarli bir xil ishlaydi. Shu sababli bitta
 * umumiy "fabrika" funksiya yozamiz. U Prisma modelini (delegate) qabul
 * qiladi va shu model uchun CRUD + ro'yxat (search/filter/sort/pagination)
 * funksiyalarini qaytaradi.
 *
 * Bu DRY (Don't Repeat Yourself) printsipi - bir xil kodni uch marta
 * yozmaslik. Yangi shunga o'xshash kontent turi kerak bo'lsa, shu fabrikani
 * qayta ishlatamiz.
 */

import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { slugify, generateUniqueSlug } from "../utils/slugify";
import { getPagination, buildMeta } from "../utils/pagination";

// Qaysi model bilan ishlayotganimiz
type ContentModel = "news" | "guide" | "opinion";

interface ListOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  status?: "DRAFT" | "PUBLISHED";
  category?: string;
  tag?: string;
  onlyPublished?: boolean;
  userId?: string; // auth bo'lsa likedByMe uchun
}

// Yaratish/yangilash uchun keladigan ma'lumotlar
interface ContentInput {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  featuredImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  status?: "DRAFT" | "PUBLISHED";
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"; // faqat guide
  categoryIds?: string[];
  tagIds?: string[];
}

export function createContentService(model: ContentModel) {
  // Prisma client'da modelga murojaat (prisma.news / prisma.guide / prisma.opinion)
  // Turli delegatlar bo'lgani uchun "any" ishlatamiz, lekin tashqi interfeys tip-xavfsiz.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegate = (prisma as any)[model];

  // Slug band-bandligini tekshiruvchi (o'zidan boshqa yozuvlarda)
  async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const found = await delegate.findUnique({ where: { slug } });
    if (!found) return false;
    if (excludeId && found.id === excludeId) return false;
    return true;
  }

  // Har bir so'rovda qaytariladigan bog'liqliklar
  const includeRelations = {
    categories: { select: { id: true, name: true, slug: true } },
    tags: { select: { id: true, name: true, slug: true } },
    author: { select: { id: true, name: true, email: true } },
    _count: { select: { comments: true, likes: true } },
  };

  // Ro'yxat yoki bitta elementga likedByMe qo'shish
  async function enrichLikedByMe<T extends { id: string }>(
    items: T[],
    userId?: string
  ): Promise<(T & { likedByMe?: boolean })[]> {
    if (!userId || items.length === 0) return items;

    const ids = items.map((i) => i.id);
    const likes = await prisma.like.findMany({
      where: {
        userId,
        ...(model === "news"
          ? { newsId: { in: ids } }
          : model === "guide"
            ? { guideId: { in: ids } }
            : { opinionId: { in: ids } }),
      },
      select: { newsId: true, guideId: true, opinionId: true },
    });

    const likedSet = new Set(
      likes.map((l) => l.newsId || l.guideId || l.opinionId)
    );
    return items.map((item) => ({ ...item, likedByMe: likedSet.has(item.id) }));
  }

  return {
    /**
     * Ro'yxat: qidiruv + filter + sort + sahifalash bilan.
     */
    async list(opts: ListOptions) {
      const { page, limit, skip } = getPagination(opts as Record<string, unknown>);

      // WHERE shartlarini yig'amiz
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};

      if (opts.onlyPublished) {
        where.status = "PUBLISHED";
        where.publishedAt = { lte: new Date() };
      } else if (opts.status) {
        where.status = opts.status;
      }

      // Qidiruv: sarlavha yoki qisqacha tavsif bo'yicha (katta-kichik harf farqsiz)
      if (opts.search) {
        where.OR = [
          { title: { contains: opts.search, mode: "insensitive" } },
          { excerpt: { contains: opts.search, mode: "insensitive" } },
        ];
      }

      if (opts.category) {
        where.categories = { some: { slug: opts.category } };
      }
      if (opts.tag) {
        where.tags = { some: { slug: opts.tag } };
      }

      // Saralash: ruxsat etilgan maydonlar bilan cheklaymiz
      const allowedSort = ["createdAt", "updatedAt", "publishedAt", "title"];
      const sortField = allowedSort.includes(opts.sort || "")
        ? (opts.sort as string)
        : "createdAt";
      const order = opts.order === "asc" ? "asc" : "desc";

      const [items, total] = await Promise.all([
        delegate.findMany({
          where,
          include: includeRelations,
          orderBy: { [sortField]: order },
          skip,
          take: limit,
        }),
        delegate.count({ where }),
      ]);

      const enriched = await enrichLikedByMe(items, opts.userId);
      return { items: enriched, meta: buildMeta(total, page, limit) };
    },

    /**
     * Slug bo'yicha bitta yozuv (asosan public sayt uchun).
     */
    async getBySlug(slug: string, onlyPublished = false, userId?: string) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = { slug };
      const item = await delegate.findUnique({
        where,
        include: {
          ...includeRelations,
          comments: {
            where: { status: "APPROVED" },
            orderBy: { createdAt: "desc" },
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

      let likedByMe = false;
      if (userId) {
        const likeWhere =
          model === "news"
            ? { userId, newsId: item.id }
            : model === "guide"
              ? { userId, guideId: item.id }
              : { userId, opinionId: item.id };
        likedByMe = Boolean(await prisma.like.findFirst({ where: likeWhere }));
      }

      return { ...item, likedByMe };
    },

    /**
     * ID bo'yicha bitta yozuv (admin tahrirlash uchun).
     */
    async getById(id: string) {
      const item = await delegate.findUnique({
        where: { id },
        include: includeRelations,
      });
      if (!item) throw AppError.notFound("Kontent topilmadi");
      return item;
    },

    /**
     * Yangi yozuv yaratish.
     */
    async create(input: ContentInput, authorId?: string) {
      if (!input.title) throw AppError.badRequest("Sarlavha majburiy");

      // Slug: berilgan bo'lsa uni, bo'lmasa title'dan yasaymiz
      const baseSlug = slugify(input.slug || input.title);
      const slug = await generateUniqueSlug(baseSlug, (s) => slugExists(s));

      // status PUBLISHED bo'lsa va publishedAt yo'q bo'lsa - hozirgi vaqt
      const publishedAt = input.status === "PUBLISHED" ? new Date() : null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = {
        title: input.title,
        slug,
        excerpt: input.excerpt ?? null,
        content: input.content ?? "",
        featuredImage: input.featuredImage ?? null,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        status: input.status ?? "DRAFT",
        publishedAt,
      };

      // Faqat guide uchun
      if (model === "guide" && input.difficulty) {
        data.difficulty = input.difficulty;
      }

      if (authorId) data.author = { connect: { id: authorId } };
      if (input.categoryIds?.length) {
        data.categories = { connect: input.categoryIds.map((id) => ({ id })) };
      }
      if (input.tagIds?.length) {
        data.tags = { connect: input.tagIds.map((id) => ({ id })) };
      }

      return delegate.create({ data, include: includeRelations });
    },

    /**
     * Yozuvni yangilash.
     */
    async update(id: string, input: ContentInput) {
      const existing = await delegate.findUnique({ where: { id } });
      if (!existing) throw AppError.notFound("Kontent topilmadi");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = {};

      if (input.title !== undefined) data.title = input.title;

      // Slug yangilanadi: aniq berilgan bo'lsa yoki title o'zgargan bo'lsa
      if (input.slug !== undefined || input.title !== undefined) {
        const base = slugify(input.slug || input.title || existing.title);
        if (base !== existing.slug) {
          data.slug = await generateUniqueSlug(base, (s) => slugExists(s, id));
        }
      }

      if (input.excerpt !== undefined) data.excerpt = input.excerpt;
      if (input.content !== undefined) data.content = input.content;
      if (input.featuredImage !== undefined) data.featuredImage = input.featuredImage;
      if (input.metaTitle !== undefined) data.metaTitle = input.metaTitle;
      if (input.metaDescription !== undefined) data.metaDescription = input.metaDescription;

      // Status o'zgarsa publishedAt'ni boshqaramiz
      if (input.status !== undefined) {
        data.status = input.status;
        if (input.status === "PUBLISHED" && !existing.publishedAt) {
          data.publishedAt = new Date();
        }
        if (input.status === "DRAFT") {
          data.publishedAt = null;
        }
      }

      if (model === "guide" && input.difficulty !== undefined) {
        data.difficulty = input.difficulty;
      }

      // Kategoriya/teglarni butunlay almashtiramiz (set)
      if (input.categoryIds !== undefined) {
        data.categories = { set: input.categoryIds.map((id) => ({ id })) };
      }
      if (input.tagIds !== undefined) {
        data.tags = { set: input.tagIds.map((id) => ({ id })) };
      }

      return delegate.update({ where: { id }, data, include: includeRelations });
    },

    /**
     * Yozuvni o'chirish.
     */
    async remove(id: string) {
      const existing = await delegate.findUnique({ where: { id } });
      if (!existing) throw AppError.notFound("Kontent topilmadi");
      await delegate.delete({ where: { id } });
      return { id };
    },

    /**
     * Tezkor holat o'zgartirish (publish/draft).
     */
    async setStatus(id: string, status: "DRAFT" | "PUBLISHED") {
      const existing = await delegate.findUnique({ where: { id } });
      if (!existing) throw AppError.notFound("Kontent topilmadi");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = { status };
      if (status === "PUBLISHED" && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
      if (status === "DRAFT") data.publishedAt = null;

      return delegate.update({ where: { id }, data, include: includeRelations });
    },
  };
}

// Tayyor instansiyalar
export const newsService = createContentService("news");
export const guideService = createContentService("guide");
export const opinionService = createContentService("opinion");
