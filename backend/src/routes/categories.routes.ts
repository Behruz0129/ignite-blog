/**
 * CATEGORIES ROUTES
 *
 * @openapi
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Kategoriyalar ro'yxati
 *     responses:
 *       200: { description: Ro'yxat }
 *   post:
 *     tags: [Categories]
 *     summary: Kategoriya yaratish (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Yaratildi }
 */

import { makeTaxonomyRouter } from "./taxonomy.routes";
import { categoryService } from "../services/taxonomy.service";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/taxonomy.validator";

export default makeTaxonomyRouter(
  categoryService,
  createCategorySchema,
  updateCategorySchema
);
