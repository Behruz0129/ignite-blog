/**
 * TOKEN yordamchilari
 * -------------------
 * Ikki xil token ishlatamiz:
 *  1) Access token (JWT) - qisqa muddatli, har so'rovda "Bearer" sifatida keladi.
 *  2) Refresh token - tasodifiy uzun satr. DB'da faqat uning sha256 hash'i
 *     saqlanadi (o'g'irlansa ham ochiq token qaytarilmaydi). Rotatsiya/bekor
 *     qilish uchun ishlatiladi.
 */

import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

// --- Access token (JWT) ---

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

// --- Refresh token (opaque) ---

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function refreshTokenExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + env.REFRESH_TOKEN_DAYS);
  return d;
}
