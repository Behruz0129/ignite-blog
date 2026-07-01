import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema } from "../validators/auth.validator";
import { authLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Tizimga kirish (token oladi)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@igniteblog.com }
 *               password: { type: string, example: Admin12345! }
 *     responses:
 *       200: { description: Muvaffaqiyatli kirildi (token qaytadi) }
 *       401: { description: Email yoki parol noto'g'ri }
 */
router.post("/login", authLimiter, validate(loginSchema), authController.login);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Tizimdan chiqish
 *     responses:
 *       200: { description: OK }
 */
router.post("/logout", authController.logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Joriy foydalanuvchi ma'lumoti
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Foydalanuvchi ma'lumoti }
 *       401: { description: Avtorizatsiya talab qilinadi }
 */
router.get("/me", authenticate, authController.me);

export default router;
