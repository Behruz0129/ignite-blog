/**
 * COMMENT ROUTES
 */

import { Router } from "express";
import { commentController } from "../controllers/comment.controller";
import { authenticate, authorize, optionalAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import {
  createCommentSchema,
  updateCommentStatusSchema,
  commentListQuerySchema,
} from "../validators/comment.validator";

const router = Router();

// PUBLIC: izoh qoldirish (auth bo'lsa avtomatik APPROVED)
router.post("/", optionalAuth, validate(createCommentSchema), commentController.create);

// USER: o'z izohini o'chirish
router.delete(
  "/:id",
  authenticate,
  validate(idParamSchema, "params"),
  commentController.remove
);

// --- ADMIN ---
router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  validate(commentListQuerySchema, "query"),
  commentController.list
);

router.patch(
  "/:id/approve",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  validate(idParamSchema, "params"),
  commentController.approve
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  validate(idParamSchema, "params"),
  commentController.reject
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("SUPER_ADMIN", "ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateCommentStatusSchema),
  commentController.updateStatus
);

export default router;
