/**
 * AUTH MIDDLEWARE
 * ---------------
 * - authenticate: so'rovda yaroqli JWT bo'lishini talab qiladi.
 * - optionalAuth: token bo'lsa req.user ga yozadi, bo'lmasa davom etadi.
 * - authorize: faqat ma'lum rollarga ruxsat beradi.
 */

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";
import { AppError } from "../utils/AppError";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
      name?: string;
      avatar?: string | null;
      provider?: string;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    throw AppError.unauthorized("Token topilmadi. Iltimos, tizimga kiring.");
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw AppError.unauthorized("Token yaroqsiz yoki muddati tugagan.");
  }
}

/** Token bo'lsa user'ni qo'shadi, bo'lmasa req.user undefined qoladi */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    req.user = verifyToken(token);
  } catch {
    // Yaroqsiz token — mehmon sifatida davom etamiz
  }
  next();
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
