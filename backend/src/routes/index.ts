/**
 * ROUTES INDEX
 * ------------
 * Barcha route modullarini bitta "/api" router ostida yig'amiz.
 * app.ts faqat shu routerni ulaydi.
 */

import { Router } from "express";
import authRoutes from "./auth.routes";
import dashboardRoutes from "./dashboard.routes";
import newsRoutes from "./news.routes";
import guidesRoutes from "./guides.routes";
import opinionsRoutes from "./opinions.routes";
import categoriesRoutes from "./categories.routes";
import tagsRoutes from "./tags.routes";
import commentsRoutes from "./comment.routes";
import mediaRoutes from "./media.routes";

const router = Router();

// Sog'liq tekshiruvi (monitoring/uptime uchun)
router.get("/health", (_req, res) => {
  res.json({ success: true, message: "API ishlamoqda", time: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/news", newsRoutes);
router.use("/guides", guidesRoutes);
router.use("/opinions", opinionsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/tags", tagsRoutes);
router.use("/comments", commentsRoutes);
router.use("/media", mediaRoutes);

export default router;
