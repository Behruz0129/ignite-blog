import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  telegramAuthSchema,
} from "../validators/auth.validator";
import { authLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.get("/config", authController.config);

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/verify-email", authLimiter, validate(verifyEmailSchema), authController.verifyEmail);
router.post(
  "/resend-verification",
  authLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification
);
router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post("/telegram", authLimiter, validate(telegramAuthSchema), authController.telegramLogin);

router.post("/refresh", authLimiter, validate(refreshSchema), authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

router.get("/google", authController.googleStart);
router.get("/google/callback", authController.googleCallback);
router.get("/discord", authController.discordStart);
router.get("/discord/callback", authController.discordCallback);

export default router;
