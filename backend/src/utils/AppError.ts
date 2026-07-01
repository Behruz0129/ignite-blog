/**
 * AppError
 * --------
 * Maxsus xato klassi. Oddiy Error'dan farqi - unda HTTP status kodi bor.
 * Bu bizga controllerlarda "throw new AppError('Topilmadi', 404)" deb
 * yozish imkonini beradi, error handler esa to'g'ri status qaytaradi.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // bu biz kutgan (foydalanuvchi) xatosi, kod bug'i emas
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = "Noto'g'ri so'rov", details?: unknown) {
    return new AppError(msg, 400, details);
  }
  static unauthorized(msg = "Avtorizatsiya talab qilinadi") {
    return new AppError(msg, 401);
  }
  static forbidden(msg = "Ruxsat yo'q") {
    return new AppError(msg, 403);
  }
  static notFound(msg = "Topilmadi") {
    return new AppError(msg, 404);
  }
  static conflict(msg = "Bunday yozuv allaqachon mavjud") {
    return new AppError(msg, 409);
  }
}
