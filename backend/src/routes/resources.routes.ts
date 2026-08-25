/**
 * RESOURCES ROUTES
 *
 * Public:
 *   GET    /                 -> chop etilganlar, guruhlarga ajratilgan
 * Admin:
 *   GET    /admin/all        -> hammasi (qoralamalar bilan)
 *   GET    /admin/:id        -> bittasi
 *   POST   /                 -> qo'shish
 *   PUT    /:id              -> yangilash
 *   DELETE /:id              -> o'chirish
 *
 * @openapi
 * /api/resources:
 *   get:
 *     tags: [Resources]
 *     summary: Foydali havolalar (guruhlangan)
 *     responses:
 *       200: { description: Ro'yxat }
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { resourceService } from "../services/resource.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, created } from "../utils/apiResponse";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { publicCache } from "../middlewares/cache.middleware";
import { idParamSchema } from "../validators/common.validator";

const resourceSchema = z.object({
  title: z.string().trim().min(2, "Nom kamida 2 belgi").max(120),
  url: z.string().trim().url("Havola to'g'ri bo'lishi kerak"),
  description: z.string().trim().max(400).optional().nullable(),
  image: z.string().trim().optional().nullable(),
  group: z.string().trim().max(60).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  order: z.coerce.number().int().optional(),
});

const updateResourceSchema = resourceSchema.partial();

const router = Router();
const adminOnly = [authenticate, authorize("SUPER_ADMIN", "ADMIN")];

router.get(
  "/",
  publicCache(),
  asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await resourceService.listPublic());
  })
);

router.get(
  "/admin/all",
  ...adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, await resourceService.listAll());
  })
);

router.get(
  "/admin/:id",
  ...adminOnly,
  validate(idParamSchema, "params"),
  asyncHandler(async (req: Request, res: Response) => {
    return ok(res, await resourceService.getById(req.params.id));
  })
);

router.post(
  "/",
  ...adminOnly,
  validate(resourceSchema),
  asyncHandler(async (req: Request, res: Response) => {
    return created(res, await resourceService.create(req.body), "Resurs qo'shildi");
  })
);

router.put(
  "/:id",
  ...adminOnly,
  validate(idParamSchema, "params"),
  validate(updateResourceSchema),
  asyncHandler(async (req: Request, res: Response) => {
    return ok(res, await resourceService.update(req.params.id, req.body), "Saqlandi");
  })
);

router.delete(
  "/:id",
  ...adminOnly,
  validate(idParamSchema, "params"),
  asyncHandler(async (req: Request, res: Response) => {
    return ok(res, await resourceService.remove(req.params.id), "O'chirildi");
  })
);

export default router;
