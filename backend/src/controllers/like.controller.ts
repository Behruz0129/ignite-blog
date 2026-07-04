import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import { likeService } from "../services/like.service";
import { AppError } from "../utils/AppError";

export const likeController = {
  toggle: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const result = await likeService.toggle({
      userId: req.user.id,
      ...req.body,
    });
    return ok(res, result);
  }),
};
