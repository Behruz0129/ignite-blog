/**
 * MEDIA CONTROLLER
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, created, paginated } from "../utils/apiResponse";
import { mediaService } from "../services/media.service";

export const mediaController = {
  upload: asyncHandler(async (req: Request, res: Response) => {
    const media = await mediaService.upload(req.file);
    return created(res, media, "Rasm yuklandi");
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await mediaService.list(req.query);
    return paginated(res, items, meta);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const result = await mediaService.remove(req.params.id);
    return ok(res, result, "Rasm o'chirildi");
  }),
};
