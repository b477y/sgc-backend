import { Router } from "express";
import {
  fileValidations,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";
import authentication from "../../middlewares/authentication.middleware.js";
import * as propertiesService from "./services/properties.service.js";

const router = Router();

router.get("/", propertiesService.getProperties);
router.get("/property/by-id", propertiesService.getProperty);
router.get("/by-user", authentication(), propertiesService.getUserProperties);
// router.get("/category/by-id", propertiesService.getProperties);
router.get(
  "/category",
  propertiesService.getProperties
);

router.post(
  "/property/like",
  authentication(),
  propertiesService.toggleLike
);

router.post("/request", authentication(), propertiesService.requestProperty);

router.post(
  "/category",
  authentication(),
  uploadCloudFile(fileValidations.image).fields([
    { name: "images", maxCount: 30 },
  ]),
  propertiesService.addPropertyByCategory
);

export default router;
