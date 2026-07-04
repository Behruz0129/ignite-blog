import crypto from "crypto";

/** Tasodifiy token (email tasdiqlash / parol tiklash uchun) */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Token muddati (soat) */
export function tokenExpiryHours(hours: number): Date {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d;
}
