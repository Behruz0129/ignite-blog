/**
 * AUTH MIDDLEWARE
 * ---------------
 * - authenticate: so'rovda yaroqli JWT bo'lishini talab qiladi.
 *   Token "Authorization: Bearer <token>" sarlavhasida keladi.
 *   Token ichidagi foydalanuvchi ma'lumotini req.user ga yozadi.
 * - authorize: faqat ma'lum rollarga ruxsat beradi (masalan ADMIN).
 */

import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/token";
import { AppError } from "../utils/AppError";

// Express'ning Request tipiga "user" maydonini qo'shamiz
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw AppError.unauthorized("Token topilmadi. Iltimos, tizimga kiring.");
  }

  const token = header.split(" ")[1];

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw AppError.unauthorized("Token yaroqsiz yoki muddati tugagan.");
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    if (roles.length && !roles.includes(req.user.role)) {
      throw AppError.forbidden("Bu amal uchun ruxsatingiz yo'q.");
    }
    next();
  };
}
