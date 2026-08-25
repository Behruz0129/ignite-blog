import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import { likeService } from "../services/like.service";
import { AppError } from "../utils/AppError";

export const likeController = {
  toggle: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const postId = typeof req.body?.postId === "string" ? req.body.postId : "";
    if (!postId) throw AppError.badRequest("postId majburiy");

    const result = await likeService.toggle(req.user.id, postId);
    return ok(res, result);
  }),
};
