/**
 * GUIDES ROUTES
 *
 * @openapi
 * /api/guides:
 *   get:
 *     tags: [Guides]
 *     summary: Chop etilgan qo'llanmalar ro'yxati
 *     responses:
 *       200: { description: Ro'yxat }
 *   post:
 *     tags: [Guides]
 *     summary: Yangi qo'llanma yaratish (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Yaratildi }
 * /api/guides/{slug}:
 *   get:
 *     tags: [Guides]
 *     summary: Slug bo'yicha bitta qo'llanma
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Qo'llanma }
 */

import { makePostRouter } from "./post.routes";
import {
  createGuideSchema,
  updateGuideSchema,
} from "../validators/content.validator";

export default makePostRouter("GUIDE", createGuideSchema, updateGuideSchema);
