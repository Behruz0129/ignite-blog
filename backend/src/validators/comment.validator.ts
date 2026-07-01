/**
 * Izoh validatorlari
 * ------------------
 * Public foydalanuvchi izoh qoldiradi (createCommentSchema).
 * Izoh aniq bitta kontentga tegishli bo'lishi kerak: newsId YOKI guideId YOKI opinionId.
 */

import { z } from "zod";

export const createCommentSchema = z
  .object({
    authorName: z.string().trim().min(2, "Ism kamida 2 belgi"),
    authorEmail: z.string().email("Email noto'g'ri"),
    content: z.string().trim().min(2, "Izoh juda qisqa").max(2000),
    newsId: z.string().optional(),
    guideId: z.string().optional(),
    opinionId: z.string().optional(),
  })
  .refine(
    (d) => Boolean(d.newsId || d.guideId || d.opinionId),
    {
      message: "Izoh qaysidir kontentga bog'lanishi kerak (newsId/guideId/opinionId).",
      path: ["newsId"],
    }
  );

// Admin izoh holatini o'zgartiradi
export const updateCommentStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

// Izohlarni filterlash uchun query
export const commentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  search: z.string().trim().optional(),
});
