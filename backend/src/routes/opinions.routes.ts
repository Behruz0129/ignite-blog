/**
 * OPINIONS ROUTES
 *
 * @openapi
 * /api/opinions:
 *   get:
 *     tags: [Opinions]
 *     summary: Chop etilgan fikr-mulohazalar ro'yxati
 *     responses:
 *       200: { description: Ro'yxat }
 *   post:
 *     tags: [Opinions]
 *     summary: Yangi maqola yaratish (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Yaratildi }
 * /api/opinions/{slug}:
 *   get:
 *     tags: [Opinions]
 *     summary: Slug bo'yicha bitta maqola
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Maqola }
 */

import { makeContentRouter } from "./content.routes";
import { opinionService } from "../services/content.service";
import {
  createOpinionSchema,
  updateOpinionSchema,
} from "../validators/content.validator";

export default makeContentRouter(
  opinionService,
  createOpinionSchema,
  updateOpinionSchema
);
