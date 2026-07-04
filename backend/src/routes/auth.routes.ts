import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  loginSchema,
  registerSchema,
  refreshSchema,
} from "../validators/auth.validator";
import { authLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authLimiter, validate(refreshSchema), authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

// OAuth
router.get("/google", authController.googleStart);
router.get("/google/callback", authController.googleCallback);
router.get("/discord", authController.discordStart);
router.get("/discord/callback", authController.discordCallback);

export default router;
