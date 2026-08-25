/**
 * RESOURCE SERVICE
 * ----------------
 * Foydali havolalar to'plami: asboblar, kanallar, saytlar.
 *
 * Maqoladan farqi — asosiy qiymat tashqi havolada, matnda emas. Shuning
 * uchun bu yerda qoralama/chop etish oqimi ham soddaroq: `status` bor, lekin
 * odatda darhol ko'rinadi.
 */

import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

export interface ResourceInput {
  title?: string;
  description?: string | null;
  url?: string;
  image?: string | null;
  group?: string | null;
  status?: "DRAFT" | "PUBLISHED";
  order?: number;
}

/** Ro'yxat doim guruh → tartib → nom bo'yicha keladi. */
const ORDER_BY = [
  { group: "asc" as const },
  { order: "asc" as const },
  { title: "asc" as const },
];

export const resourceService = {
  /** Public ro'yxat: faqat chop etilganlar, guruhlarga ajratilgan holda. */
  async listPublic() {
    const items = await prisma.resource.findMany({
      where: { status: "PUBLISHED" },
      orderBy: ORDER_BY,
    });

    // Guruhlash serverda bajariladi: mijozda takrorlanmasin va guruhlar
    // tartibi hamma joyda bir xil bo'lsin.
    const groups = new Map<string, typeof items>();
    for (const item of items) {
      const key = item.group?.trim() || "Boshqa";
      const list = groups.get(key) ?? [];
      list.push(item);
      groups.set(key, list);
    }

    return {
      total: items.length,
      groups: [...groups.entries()].map(([name, list]) => ({ name, items: list })),
    };
  },

  /** Admin ro'yxati: qoralamalar ham ko'rinadi. */
  async listAll() {
    return prisma.resource.findMany({ orderBy: ORDER_BY });
  },

  async getById(id: string) {
    const item = await prisma.resource.findUnique({ where: { id } });
    if (!item) throw AppError.notFound("Resurs topilmadi");
    return item;
  },

  async create(input: ResourceInput) {
    if (!input.title?.trim()) throw AppError.badRequest("Nom majburiy");
    if (!input.url?.trim()) throw AppError.badRequest("Havola majburiy");

    return prisma.resource.create({
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        url: input.url.trim(),
        image: input.image?.trim() || null,
        group: input.group?.trim() || null,
        status: input.status ?? "PUBLISHED",
        order: input.order ?? 0,
      },
    });
  },

  async update(id: string, input: ResourceInput) {
    await this.getById(id);

    const data: ResourceInput = {};
    if (input.title !== undefined) data.title = input.title.trim();
    if (input.url !== undefined) data.url = input.url.trim();
    if (input.description !== undefined) data.description = input.description?.trim() || null;
    if (input.image !== undefined) data.image = input.image?.trim() || null;
    if (input.group !== undefined) data.group = input.group?.trim() || null;
    if (input.status !== undefined) data.status = input.status;
    if (input.order !== undefined) data.order = input.order;

    return prisma.resource.update({ where: { id }, data });
  },

  async remove(id: string) {
    await this.getById(id);
    await prisma.resource.delete({ where: { id } });
    return { ok: true };
  },
};
