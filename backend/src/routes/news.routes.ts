/**
 * NEWS ROUTES
 *
 * @openapi
 * /api/news:
 *   get:
 *     tags: [News]
 *     summary: Chop etilgan yangiliklar ro'yxati
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer }, description: Sahifa }
 *       - { in: query, name: limit, schema: { type: integer }, description: Sahifadagi soni }
 *       - { in: query, name: search, schema: { type: string }, description: Qidiruv }
 *       - { in: query, name: category, schema: { type: string }, description: Kategoriya slug }
 *       - { in: query, name: tag, schema: { type: string }, description: Teg slug }
 *       - { in: query, name: sort, schema: { type: string }, description: "createdAt|publishedAt|title" }
 *       - { in: query, name: order, schema: { type: string, enum: [asc, desc] } }
 *     responses:
 *       200: { description: Ro'yxat }
 *   post:
 *     tags: [News]
 *     summary: Yangi yangilik yaratish (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Yaratildi }
 * /api/news/{slug}:
 *   get:
 *     tags: [News]
 *     summary: Slug bo'yicha bitta yangilik
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Yangilik }
 *       404: { description: Topilmadi }
 */

import { makeContentRouter } from "./content.routes";
import { newsService } from "../services/content.service";
import {
  createNewsSchema,
  updateNewsSchema,
} from "../validators/content.validator";

export default makeContentRouter(newsService, createNewsSchema, updateNewsSchema);
