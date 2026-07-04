import { z } from "zod";

export const toggleLikeSchema = z
  .object({
    newsId: z.string().optional(),
    guideId: z.string().optional(),
    opinionId: z.string().optional(),
  })
  .refine((d) => Boolean(d.newsId || d.guideId || d.opinionId), {
    message: "Like qaysidir kontentga bog'lanishi kerak (newsId/guideId/opinionId).",
    path: ["newsId"],
  });
