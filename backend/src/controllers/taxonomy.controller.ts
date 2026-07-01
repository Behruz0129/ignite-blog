/**
 * TAXONOMY CONTROLLER (Category / Tag)
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, created } from "../utils/apiResponse";
import { createTaxonomyService } from "../services/taxonomy.service";

type TaxService = ReturnType<typeof createTaxonomyService>;

export function createTaxonomyController(service: TaxService) {
  return {
    list: asyncHandler(async (req: Request, res: Response) => {
      const items = await service.list(req.query.search as string | undefined);
      return ok(res, items);
    }),

    getById: asyncHandler(async (req: Request, res: Response) => {
      const item = await service.getById(req.params.id);
      return ok(res, item);
    }),

    create: asyncHandler(async (req: Request, res: Response) => {
      const item = await service.create(req.body.name, req.body.slug);
      return created(res, item, "Yaratildi");
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
      const item = await service.update(req.params.id, req.body.name, req.body.slug);
      return ok(res, item, "Yangilandi");
    }),

    remove: asyncHandler(async (req: Request, res: Response) => {
      const result = await service.remove(req.params.id);
      return ok(res, result, "O'chirildi");
    }),
  };
}
