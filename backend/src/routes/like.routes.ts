import { Router } from "express";
import { likeController } from "../controllers/like.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { toggleLikeSchema } from "../validators/like.validator";

const router = Router();

router.post("/toggle", authenticate, validate(toggleLikeSchema), likeController.toggle);

export default router;
