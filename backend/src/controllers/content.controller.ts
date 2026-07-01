/**
 * CONTENT CONTROLLER (factory)
 * ----------------------------
 * News/Guides/Opinions uchun bir xil controller. content.service fabrikasi
 * qaytargan service'ni qabul qiladi.
 *
 * Public endpointlar (list/getBySlug) faqat PUBLISHED kontentni qaytaradi.
 * Admin endpointlar (adminList/getById/create/update/remove/setStatus) himoyalangan.
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, created, paginated } from "../utils/apiResponse";
import { createContentService } from "../services/content.service";

type ContentService = ReturnType<typeof createContentService>;

export function createContentController(service: ContentService) {
  return {
    // --- PUBLIC ---
    publicList: asyncHandler(async (req: Request, res: Response) => {
      const { items, meta } = await service.list({
        ...req.query,
        onlyPublished: true,
      });
      return paginated(res, items, meta);
    }),

    publicGetBySlug: asyncHandler(async (req: Request, res: Response) => {
      const item = await service.getBySlug(req.params.slug, true);
      return ok(res, item);
    }),

    // --- ADMIN ---
    adminList: asyncHandler(async (req: Request, res: Response) => {
      const { items, meta } = await service.list({ ...req.query });
      return paginated(res, items, meta);
    }),

    adminGetById: asyncHandler(async (req: Request, res: Response) => {
      const item = await service.getById(req.params.id);
      return ok(res, item);
    }),

    create: asyncHandler(async (req: Request, res: Response) => {
      const item = await service.create(req.body, req.user?.id);
      return created(res, item, "Kontent yaratildi");
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
      const item = await service.update(req.params.id, req.body);
      return ok(res, item, "Kontent yangilandi");
    }),

    remove: asyncHandler(async (req: Request, res: Response) => {
      const result = await service.remove(req.params.id);
      return ok(res, result, "Kontent o'chirildi");
    }),

    publish: asyncHandler(async (req: Request, res: Response) => {
      const item = await service.setStatus(req.params.id, "PUBLISHED");
      return ok(res, item, "Chop etildi");
    }),

    unpublish: asyncHandler(async (req: Request, res: Response) => {
      const item = await service.setStatus(req.params.id, "DRAFT");
      return ok(res, item, "Qoralamaga o'tkazildi");
    }),
  };
}
