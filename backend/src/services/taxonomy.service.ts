/**
 * TAXONOMY SERVICE
 * ----------------
 * Category va Tag bir xil tuzilishga ega (id, name, slug). Shuning uchun
 * bularni ham bitta fabrika orqali yaratamiz.
 */

import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { slugify, generateUniqueSlug } from "../utils/slugify";

type TaxModel = "category" | "tag";

export function createTaxonomyService(model: TaxModel) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegate = (prisma as any)[model];

  async function slugExists(slug: string, excludeId?: string) {
    const found = await delegate.findUnique({ where: { slug } });
    if (!found) return false;
    if (excludeId && found.id === excludeId) return false;
    return true;
  }

  return {
    async list(search?: string) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};
      if (search) {
        where.name = { contains: search, mode: "insensitive" };
      }
      return delegate.findMany({
        where,
        orderBy: { name: "asc" },
        include: {
          _count: { select: { news: true, guides: true, opinions: true } },
        },
      });
    },

    async getById(id: string) {
      const item = await delegate.findUnique({ where: { id } });
      if (!item) throw AppError.notFound();
      return item;
    },

    async create(name: string, slug?: string) {
      const base = slugify(slug || name);
      const finalSlug = await generateUniqueSlug(base, (s) => slugExists(s));
      return delegate.create({ data: { name, slug: finalSlug } });
    },

    async update(id: string, name?: string, slug?: string) {
      const existing = await delegate.findUnique({ where: { id } });
      if (!existing) throw AppError.notFound();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = {};
      if (name !== undefined) data.name = name;
      if (slug !== undefined || name !== undefined) {
        const base = slugify(slug || name || existing.name);
        if (base !== existing.slug) {
          data.slug = await generateUniqueSlug(base, (s) => slugExists(s, id));
        }
      }
      return delegate.update({ where: { id }, data });
    },

    async remove(id: string) {
      const existing = await delegate.findUnique({ where: { id } });
      if (!existing) throw AppError.notFound();
      await delegate.delete({ where: { id } });
      return { id };
    },
  };
}

export const categoryService = createTaxonomyService("category");
export const tagService = createTaxonomyService("tag");
