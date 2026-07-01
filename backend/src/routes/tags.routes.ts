/**
 * TAGS ROUTES
 *
 * @openapi
 * /api/tags:
 *   get:
 *     tags: [Tags]
 *     summary: Teglar ro'yxati
 *     responses:
 *       200: { description: Ro'yxat }
 *   post:
 *     tags: [Tags]
 *     summary: Teg yaratish (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Yaratildi }
 */

import { makeTaxonomyRouter } from "./taxonomy.routes";
import { tagService } from "../services/taxonomy.service";
import {
  createTagSchema,
  updateTagSchema,
} from "../validators/taxonomy.validator";

export default makeTaxonomyRouter(tagService, createTagSchema, updateTagSchema);
