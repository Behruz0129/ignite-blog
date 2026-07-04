/**
 * MEDIA ROUTES (barchasi himoyalangan)
 *
 *   POST   /upload   -> rasm yuklash (multipart/form-data, "file" maydoni)
 *   GET    /         -> media ro'yxati (qayta ishlatish uchun)
 *   DELETE /:id      -> o'chirish
 */

import { Router } from "express";
import { mediaController } from "../controllers/media.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";

const router = Router();

router.use(authenticate, authorize("SUPER_ADMIN", "ADMIN"));

/**
 * @openapi
 * /api/media/upload:
 *   post:
 *     tags: [Media]
 *     summary: Rasm yuklash (Cloudinary)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201: { description: Rasm yuklandi }
 */
router.post("/upload", upload.single("file"), mediaController.upload);

router.get("/", mediaController.list);

router.delete("/:id", validate(idParamSchema, "params"), mediaController.remove);

export default router;
