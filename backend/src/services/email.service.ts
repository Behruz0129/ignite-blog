/**
 * EMAIL SERVICE (Resend)
 * ----------------------
 * Email tasdiqlash va parol tiklash xabarlarini yuboradi.
 * Production'da RESEND_API_KEY majburiy — bo'lmasa aniq xato qaytariladi.
 */

import { Resend } from "resend";
import { env, isEmailConfigured } from "../config/env";
import { logger } from "../config/logger";
import { AppError } from "../utils/AppError";

let resend: Resend | null = null;
if (isEmailConfigured) {
  resend = new Resend(env.RESEND_API_KEY);
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    if (env.NODE_ENV === "production") {
      throw AppError.badRequest(
        "Email xizmati sozlanmagan. Render'da RESEND_API_KEY qo'shing."
      );
    }
    // Dev: console'ga yozamiz (haqiqiy email ketmaydi)
    logger.info(`[EMAIL DEV] To: ${to} | Subject: ${subject}\n${html}`);
    return;
  }

  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    logger.error("Resend xatosi:", error);
    throw AppError.badRequest(
      `Email yuborilmadi: ${error.message}. Resend'da domen yoki EMAIL_FROM ni tekshiring.`
    );
  }

  logger.info(`Email yuborildi: ${to} (id: ${data?.id ?? "?"})`);
}

export const emailService = {
  async sendVerification(to: string, name: string, token: string) {
    const link = `${env.FRONTEND_URL}/verify-email?token=${token}`;
    const html = `
      <h2>Salom, ${name}!</h2>
      <p>Ignite Blog'da ro'yxatdan o'tganingiz uchun rahmat.</p>
      <p>Email manzilingizni tasdiqlash uchun quyidagi havolani bosing:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Havola 24 soat amal qiladi.</p>
      <p>Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.</p>
    `;
    await sendEmail(to, "Email manzilingizni tasdiqlang — Ignite Blog", html);
  },

  async sendPasswordReset(to: string, name: string, token: string) {
    const link = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
      <h2>Salom, ${name}!</h2>
      <p>Parolingizni tiklash so'rovi qabul qilindi.</p>
      <p><a href="${link}">Parolni tiklash</a></p>
      <p>Havola 1 soat amal qiladi.</p>
      <p>Agar siz so'ramagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.</p>
    `;
    await sendEmail(to, "Parolni tiklash — Ignite Blog", html);
  },
};
