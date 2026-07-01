/**
 * Kategoriya va Teg validatorlari (taxonomy = tasniflash)
 */

import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Nomi kamida 2 belgidan iborat bo'lishi kerak"),
  slug: z.string().trim().optional(),
});
export const updateCategorySchema = createCategorySchema.partial();

export const createTagSchema = z.object({
  name: z.string().trim().min(2, "Nomi kamida 2 belgidan iborat bo'lishi kerak"),
  slug: z.string().trim().optional(),
});
export const updateTagSchema = createTagSchema.partial();
