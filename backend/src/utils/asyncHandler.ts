/**
 * asyncHandler
 * ------------
 * Express'da async controllerlarda xatolik yuz bersa, uni qo'lda
 * try/catch qilib next(err) chaqirish kerak bo'ladi. Bu zerikarli.
 * Bu wrapper buni avtomatlashtiradi: har qanday "throw" yoki rad etilgan
 * Promise to'g'ridan-to'g'ri error handler middleware'ga boradi.
 *
 * Foydalanish:
 *   router.get("/", asyncHandler(async (req, res) => { ... }))
 */

import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
