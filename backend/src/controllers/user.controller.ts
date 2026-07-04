import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ok, created, paginated } from "../utils/apiResponse";
import { userService } from "../services/user.service";
import { AppError } from "../utils/AppError";

export const userController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await userService.list(req.query);
    return paginated(res, items, meta);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.create(req.body);
    return created(res, user, "Foydalanuvchi yaratildi");
  }),

  updateRole: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const user = await userService.updateRole(
      req.params.id,
      req.body.role,
      req.user.id
    );
    return ok(res, user, "Rol yangilandi");
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.resetPassword(req.params.id, req.body.password);
    return ok(res, result, "Parol yangilandi");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const result = await userService.remove(req.params.id, req.user.id);
    return ok(res, result, "Foydalanuvchi o'chirildi");
  }),
};
