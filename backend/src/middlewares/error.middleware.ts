/**
 * ERROR HANDLING MIDDLEWARE
 * -------------------------
 * Express'da 4 ta argumentli (err, req, res, next) middleware "xato ushlovchi"
 * hisoblanadi. Barcha throw qilingan xatolar shu yerga keladi va bir xil
 * formatda javob qaytariladi.
 *
 * Prisma'ning ba'zi xatolari (masalan unique constraint) ham bu yerda
 * tushunarli xabarga aylantiriladi.
 */

import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { logger } from "../config/logger";
import { env } from "../config/env";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  let statusCode = 500;
  let message = "Serverda kutilmagan xatolik";
  let details: unknown = undefined;

  // 1) Bizning maxsus xatomiz
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  }
  // 2) Prisma xatolari
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      const target = (err.meta?.target as string[])?.join(", ") ?? "maydon";
      message = `Bu ${target} qiymati allaqachon mavjud.`;
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Yozuv topilmadi.";
    } else {
      statusCode = 400;
      message = "Ma'lumotlar bazasi so'rovi xatosi.";
    }
  }
  // 3) Oddiy Error
  else if (err instanceof Error) {
    message = err.message;
  }

  // 500 xatolarni to'liq logga yozamiz (kod bug'i bo'lishi mumkin)
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message}`);
    if (err instanceof Error) logger.error(err.stack || "");
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {}),
    // Stack faqat development rejimida ko'rsatiladi
    ...(env.NODE_ENV === "development" && err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
}
