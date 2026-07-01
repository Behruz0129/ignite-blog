/**
 * UMUMIY VALIDATORLAR
 * -------------------
 * Bir nechta joyda takrorlanadigan sxema bo'laklari.
 */

import { z } from "zod";

// Ro'yxat (list) so'rovlari uchun umumiy query parametrlari:
// ?page=1&limit=10&search=...&sort=createdAt&order=desc&status=PUBLISHED
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().optional(),
  sort: z.string().trim().optional(),
  order: z.enum(["asc", "desc"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  category: z.string().trim().optional(), // category slug bo'yicha filter
  tag: z.string().trim().optional(), // tag slug bo'yicha filter
});

// URL'dagi :id parametri uchun
export const idParamSchema = z.object({
  id: z.string().min(1, "id majburiy"),
});

// URL'dagi :slug parametri uchun
export const slugParamSchema = z.object({
  slug: z.string().min(1, "slug majburiy"),
});
