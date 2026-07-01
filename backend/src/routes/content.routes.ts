/**
 * CONTENT ROUTES (factory)
 * ------------------------
 * News/Guides/Opinions uchun bir xil route to'plamini yaratadi.
 *
 * Public (token shart emas):
 *   GET    /            -> chop etilgan ro'yxat (search/filter/sort/pagination)
 *   GET    /:slug       -> bitta yozuv (slug bo'yicha)
 *
 * Admin (JWT + ADMIN/EDITOR roli):
 *   GET    /admin/all   -> barcha (qoralama + chop etilgan)
 *   GET    /admin/:id   -> id bo'yicha (tahrirlash uchun)
 *   POST   /            -> yaratish
 *   PUT    /:id         -> yangilash
 *   DELETE /:id         -> o'chirish
 *   PATCH  /:id/publish -> chop etish
 *   PATCH  /:id/unpublish -> qoralamaga o'tkazish
 */

import { Router } from "express";
import { AnyZodObject } from "zod";
import { createContentService } from "../services/content.service";
import { createContentController } from "../controllers/content.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  listQuerySchema,
  idParamSchema,
  slugParamSchema,
} from "../validators/common.validator";

type ContentService = ReturnType<typeof createContentService>;

export function makeContentRouter(
  service: ContentService,
  createSchema: AnyZodObject,
  updateSchema: AnyZodObject
): Router {
  const router = Router();
  const ctrl = createContentController(service);

  // --- PUBLIC ---
  router.get("/", validate(listQuerySchema, "query"), ctrl.publicList);

  // --- ADMIN ---
  // Diqqat: aniq yo'llar (/admin/...) dinamik /:slug dan OLDIN turishi kerak.
  router.get(
    "/admin/all",
    authenticate,
    authorize("ADMIN", "EDITOR"),
    validate(listQuerySchema, "query"),
    ctrl.adminList
  );

  router.get(
    "/admin/:id",
    authenticate,
    authorize("ADMIN", "EDITOR"),
    validate(idParamSchema, "params"),
    ctrl.adminGetById
  );

  router.post(
    "/",
    authenticate,
    authorize("ADMIN", "EDITOR"),
    validate(createSchema),
    ctrl.create
  );

  router.put(
    "/:id",
    authenticate,
    authorize("ADMIN", "EDITOR"),
    validate(idParamSchema, "params"),
    validate(updateSchema),
    ctrl.update
  );

  router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN", "EDITOR"),
    validate(idParamSchema, "params"),
    ctrl.remove
  );

  router.patch(
    "/:id/publish",
    authenticate,
    authorize("ADMIN", "EDITOR"),
    validate(idParamSchema, "params"),
    ctrl.publish
  );

  router.patch(
    "/:id/unpublish",
    authenticate,
    authorize("ADMIN", "EDITOR"),
    validate(idParamSchema, "params"),
    ctrl.unpublish
  );

  // Public slug route - eng oxirida (boshqa yo'llarni "yutib yubormasligi" uchun)
  router.get("/:slug", validate(slugParamSchema, "params"), ctrl.publicGetBySlug);

  return router;
}
