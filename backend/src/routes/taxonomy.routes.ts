/**
 * TAXONOMY ROUTES (Category / Tag) factory
 *
 * Public:  GET /            -> ro'yxat (search bilan)
 * Admin:   POST /, PUT /:id, DELETE /:id, GET /:id
 */

import { Router } from "express";
import { AnyZodObject } from "zod";
import { createTaxonomyService } from "../services/taxonomy.service";
import { createTaxonomyController } from "../controllers/taxonomy.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";

type TaxService = ReturnType<typeof createTaxonomyService>;

export function makeTaxonomyRouter(
  service: TaxService,
  createSchema: AnyZodObject,
  updateSchema: AnyZodObject
): Router {
  const router = Router();
  const ctrl = createTaxonomyController(service);

  router.get("/", ctrl.list);
  router.get("/:id", validate(idParamSchema, "params"), ctrl.getById);

  router.post(
    "/",
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN"),
    validate(createSchema),
    ctrl.create
  );
  router.put(
    "/:id",
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN"),
    validate(idParamSchema, "params"),
    validate(updateSchema),
    ctrl.update
  );
  router.delete(
    "/:id",
    authenticate,
    authorize("SUPER_ADMIN"),
    validate(idParamSchema, "params"),
    ctrl.remove
  );

  return router;
}
