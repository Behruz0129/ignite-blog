/**
 * KONTENT VALIDATORLARI
 * ---------------------
 * News, Guides, Opinions deyarli bir xil maydonlarga ega.
 * Shu sababli umumiy "base" sxema yaratamiz va kerakli joyda kengaytiramiz.
 *
 * Eslatma: slug ixtiyoriy. Agar berilmasa, server title'dan avtomatik yasaydi.
 */

import { z } from "zod";

const baseContentSchema = {
  title: z.string().trim().min(3, "Sarlavha kamida 3 belgidan iborat bo'lishi kerak"),
  slug: z.string().trim().optional(),
  excerpt: z.string().trim().max(500).optional().nullable(),
  content: z.string().min(1, "Kontent bo'sh bo'lmasligi kerak"),
  featuredImage: z.string().url("featuredImage to'g'ri URL bo'lishi kerak").optional().nullable(),
  metaTitle: z.string().trim().max(160).optional().nullable(),
  metaDescription: z.string().trim().max(300).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  // Kategoriya/teg id'lari massivi
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
};

// --- NEWS ---
export const createNewsSchema = z.object({ ...baseContentSchema });
export const updateNewsSchema = z.object({ ...baseContentSchema }).partial();

// --- OPINIONS ---
export const createOpinionSchema = z.object({ ...baseContentSchema });
export const updateOpinionSchema = z.object({ ...baseContentSchema }).partial();

// --- GUIDES (qo'shimcha: difficulty) ---
export const createGuideSchema = z.object({
  ...baseContentSchema,
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
});
export const updateGuideSchema = createGuideSchema.partial();

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type CreateGuideInput = z.infer<typeof createGuideSchema>;
export type CreateOpinionInput = z.infer<typeof createOpinionSchema>;
