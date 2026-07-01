/**
 * VALIDATE MIDDLEWARE (Zod)
 * -------------------------
 * Berilgan Zod sxemasi asosida req.body / req.query / req.params ni tekshiradi.
 * Xato bo'lsa 400 va tushunarli xabarlar qaytaradi.
 * To'g'ri bo'lsa - tozalangan (parse qilingan) qiymatni qaytadan req ga yozadi.
 */

import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { AppError } from "../utils/AppError";

type RequestPart = "body" | "query" | "params";

export function validate(schema: ZodTypeAny, part: RequestPart = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[part]);
      // Tozalangan qiymatni qaytadan yozamiz (default qiymatlar bilan)
      req[part] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        throw AppError.badRequest("Validatsiya xatosi", details);
      }
      throw err;
    }
  };
}
