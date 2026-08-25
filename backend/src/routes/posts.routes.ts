/**
 * POSTS ROUTES — uchala turdagi kontentning aralash oqimi.
 *
 * `/api/news`, `/api/guides`, `/api/opinions` bitta turni beradi; bu yo'l esa
 * hammasini birga qaytaradi (saytdagi "Barchasi" bo'limi va adminkadagi
 * umumiy ro'yxat uchun). `?type=NEWS` bilan cheklash ham mumkin.
 *
 * Bitta yozuvni slug bo'yicha olish bu yerda yo'q: slug tur ichida unikal,
 * shuning uchun `/news/:slug` kabi turli yo'llardan olinadi.
 *
 * @openapi
 * /api/posts:
 *   get:
 *     tags: [Posts]
 *     summary: Barcha turdagi chop etilgan kontent (aralash)
 *     parameters:
 *       - { in: query, name: type, schema: { type: string, enum: [NEWS, GUIDE, OPINION] } }
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: category, schema: { type: string }, description: Kategoriya slug }
 *       - { in: query, name: tag, schema: { type: string }, description: Teg slug }
 *     responses:
 *       200: { description: Ro'yxat }
 */

import { Router } from "express";
import { createPostController } from "../controllers/post.controller";
import { optionalAuth, authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { publicCache } from "../middlewares/cache.middleware";
import { postListQuerySchema } from "../validators/common.validator";

const router = Router();
const ctrl = createPostController(); // tur yo'q — hammasi

router.get(
  "/",
  publicCache(),
  optionalAuth,
  validate(postListQuerySchema, "query"),
  ctrl.publicList
);

router.get(
  "/admin/all",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  validate(postListQuerySchema, "query"),
  ctrl.adminList
);

export default router;
