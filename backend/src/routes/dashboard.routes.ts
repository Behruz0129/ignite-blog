/**
 * DASHBOARD ROUTES (himoyalangan)
 */

import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /api/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Statistika (jami news/guides/opinions/comments)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Statistika }
 */
router.get(
  "/stats",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  dashboardController.stats
);

export default router;
