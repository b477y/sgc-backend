import { Router } from "express";
import {
  fileValidations,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";
import addProperty from "./services/addProperty.service.js";
import getProperties from "./services/getProperties.service.js";
import requestProperty from "./services/requestProperty.service.js";
import getProperty from "./services/getProperty.service.js";
import authentication from "../../middlewares/authentication.middleware.js";
import getResidentialProperties from "./services/getResidentialProperties.service.js";
import addPropertyByCategory from "./services/addPropertyByCategory.service.js";
import * as propertiesService from "./services/properties.service.js";

const router = Router();

router.get("/by-user", authentication(), propertiesService.getUserProperties);

router.post(
  "/",
  uploadCloudFile(fileValidations.image).fields([
    { name: "images", maxCount: 30 },
  ]),
  addProperty
);

router.post(
  "/category/:categoryId/:subcategoryId",
  authentication(),
  uploadCloudFile(fileValidations.image).fields([
    { name: "images", maxCount: 30 },
  ]),
  addPropertyByCategory
);

router.post("/request", requestProperty);

router.get("/", getProperties);

router.get("/:propertyId", getProperty);

router.get("/category/:categoryId", getProperties);

router.get("/category/:categoryId/:subcategoryId", getProperties);

export default router;
