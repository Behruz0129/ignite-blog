import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  loginSchema,
  refreshSchema,
  telegramAuthSchema,
} from "../validators/auth.validator";
import { authLimiter, refreshLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

/**
 * Ro'yxatdan o'tish faqat Telegram (va sozlansa Google/Discord) orqali.
 * Email + parol bilan ro'yxatdan o'tish ataylab yo'q: auditoriya Telegram'da,
 * bir bosishda kirish qulayroq va email tasdiqlash uchun tashqi xizmat
 * (Resend) saqlab turish shart emas.
 *
 * `/login` esa qoladi — adminlar (seed orqali yaratilgan) shu yo'l bilan kiradi.
 */

router.get("/config", authController.config);

router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/telegram", authLimiter, validate(telegramAuthSchema), authController.telegramLogin);

router.post("/refresh", refreshLimiter, validate(refreshSchema), authController.refresh);
// OAuth'dan qaytgan bir martalik kodni tokenlarga almashtirish
router.post("/exchange", authLimiter, authController.exchange);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

router.get("/google", authController.googleStart);
router.get("/google/callback", authController.googleCallback);
router.get("/discord", authController.discordStart);
router.get("/discord/callback", authController.discordCallback);

export default router;
