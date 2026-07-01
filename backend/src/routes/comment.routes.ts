/**
 * COMMENT ROUTES
 *
 * Public:  POST /            -> izoh qoldirish
 * Admin:   GET /, PATCH /:id/approve, PATCH /:id/reject, PATCH /:id/status, DELETE /:id
 */

import { Router } from "express";
import { commentController } from "../controllers/comment.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import {
  createCommentSchema,
  updateCommentStatusSchema,
  commentListQuerySchema,
} from "../validators/comment.validator";

const router = Router();

/**
 * @openapi
 * /api/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Izoh qoldirish (public)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [authorName, authorEmail, content]
 *             properties:
 *               authorName: { type: string }
 *               authorEmail: { type: string }
 *               content: { type: string }
 *               newsId: { type: string }
 *               guideId: { type: string }
 *               opinionId: { type: string }
 *     responses:
 *       201: { description: Izoh qabul qilindi (PENDING) }
 */
router.post("/", validate(createCommentSchema), commentController.create);

// --- ADMIN ---
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "EDITOR"),
  validate(commentListQuerySchema, "query"),
  commentController.list
);

router.patch(
  "/:id/approve",
  authenticate,
  authorize("ADMIN", "EDITOR"),
  validate(idParamSchema, "params"),
  commentController.approve
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize("ADMIN", "EDITOR"),
  validate(idParamSchema, "params"),
  commentController.reject
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "EDITOR"),
  validate(idParamSchema, "params"),
  validate(updateCommentStatusSchema),
  commentController.updateStatus
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "EDITOR"),
  validate(idParamSchema, "params"),
  commentController.remove
);

export default router;
