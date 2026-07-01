/**
 * NOT FOUND MIDDLEWARE
 * --------------------
 * Hech bir route mos kelmasa ishga tushadi (404).
 * Barcha route'lardan KEYIN, error handler'dan OLDIN ulanadi.
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound(`Manzil topilmadi: ${req.method} ${req.originalUrl}`));
}
