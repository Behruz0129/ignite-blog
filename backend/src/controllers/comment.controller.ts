/**
 * COMMENT CONTROLLER
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, created, paginated } from "../utils/apiResponse";
import { commentService } from "../services/comment.service";

export const commentController = {
  // PUBLIC: izoh qoldirish
  create: asyncHandler(async (req: Request, res: Response) => {
    const comment = await commentService.create(req.body);
    return created(
      res,
      comment,
      "Izohingiz qabul qilindi. Moderatsiyadan keyin ko'rinadi."
    );
  }),

  // ADMIN: barcha izohlar
  list: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await commentService.list(req.query);
    return paginated(res, items, meta);
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    const item = await commentService.updateStatus(req.params.id, "APPROVED");
    return ok(res, item, "Izoh tasdiqlandi");
  }),

  reject: asyncHandler(async (req: Request, res: Response) => {
    const item = await commentService.updateStatus(req.params.id, "REJECTED");
    return ok(res, item, "Izoh rad etildi");
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const item = await commentService.updateStatus(req.params.id, req.body.status);
    return ok(res, item, "Holat yangilandi");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const result = await commentService.remove(req.params.id);
    return ok(res, result, "Izoh o'chirildi");
  }),
};
