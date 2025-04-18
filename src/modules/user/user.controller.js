import { Router } from "express";
import authentication from "../../middlewares/authentication.middleware.js";
import * as userService from "./services/user.service.js";

const router = Router();

router.get("/profile", authentication(), userService.getProfile);
router.get(
  "/requested-properties",
  authentication(),
  userService.getRequestedProperties
);
router.get("/liked-properties", authentication(), userService.getLikedProperties);

export default router;
