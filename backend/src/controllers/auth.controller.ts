/**
 * AUTH CONTROLLER
 * ---------------
 * Controller'lar HTTP qatlami: so'rovdan ma'lumot oladi, service'ni chaqiradi,
 * javob qaytaradi. Biznes logika service'da, controller "yupqa" bo'ladi.
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authService } from "../services/auth.service";
import { ok } from "../utils/apiResponse";
import { AppError } from "../utils/AppError";

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    return ok(res, result, "Muvaffaqiyatli kirildi");
  }),

  // JWT'da logout serverda holatsiz: client tokenni o'chiradi.
  logout: asyncHandler(async (_req: Request, res: Response) => {
    return ok(res, null, "Tizimdan chiqildi. Tokenni o'chiring.");
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const user = await authService.me(req.user.id);
    return ok(res, user);
  }),
};
