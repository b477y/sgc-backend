import { Router } from "express";
import {
  fileValidations,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";
import authentication from "../../middlewares/authentication.middleware.js";
import * as propertiesService from "./services/properties.service.js";

const router = Router();

router.get("/", propertiesService.getProperties);
router.get("/property/:propertyId", propertiesService.getProperty);
router.get("/by-user", authentication(), propertiesService.getUserProperties);
router.get("/category/:categoryId", propertiesService.getProperties);
router.get(
  "/category/:categoryId/:subcategoryId",
  propertiesService.getProperties
);

router.post(
  "/property/:propertyId/like",
  authentication(),
  propertiesService.toggleLike
);

router.post("/request", authentication(), propertiesService.requestProperty);

router.post(
  "/category/:categoryId/:subcategoryId",
  authentication(),
  uploadCloudFile(fileValidations.image).fields([
    { name: "images", maxCount: 30 },
  ]),
  propertiesService.addPropertyByCategory
);

export default router;
