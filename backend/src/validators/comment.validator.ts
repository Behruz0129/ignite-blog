/**
 * Izoh validatorlari
 */

import { z } from "zod";

export const createCommentSchema = z
  .object({
    authorName: z.string().trim().min(2).optional(),
    authorEmail: z.string().email().optional(),
    content: z.string().trim().min(2, "Izoh juda qisqa").max(2000),
    newsId: z.string().optional(),
    guideId: z.string().optional(),
    opinionId: z.string().optional(),
  })
  .refine((d) => Boolean(d.newsId || d.guideId || d.opinionId), {
    message: "Izoh qaysidir kontentga bog'lanishi kerak (newsId/guideId/opinionId).",
    path: ["newsId"],
  });

export const updateCommentStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export const commentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  search: z.string().trim().optional(),
});
