import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import {
  createUserSchema,
  updateRoleSchema,
  resetPasswordSchema,
  userListQuerySchema,
} from "../validators/user.validator";

const router = Router();

router.use(authenticate, authorize("SUPER_ADMIN"));

router.get("/", validate(userListQuerySchema, "query"), userController.list);
router.post("/", validate(createUserSchema), userController.create);
router.patch(
  "/:id/role",
  validate(idParamSchema, "params"),
  validate(updateRoleSchema),
  userController.updateRole
);
router.patch(
  "/:id/password",
  validate(idParamSchema, "params"),
  validate(resetPasswordSchema),
  userController.resetPassword
);
router.delete("/:id", validate(idParamSchema, "params"), userController.remove);

export default router;
