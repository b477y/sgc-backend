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
import addPropertyByCategory from "./services/addPropertyByCategory.service.js";
// import * as propertiesService from "./services/properties.service.js";
import getUserProperties from "./services/getUserProperties.service.js";

const router = Router();

router.get("/", getProperties);
router.get("/property/:propertyId", getProperty);
router.get("/by-user", authentication(), getUserProperties);

router.post("/request", requestProperty);

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

router.get("/category/:categoryId", getProperties);

router.get("/category/:categoryId/:subcategoryId", getProperties);
export default router;

// will be deleted
// getUserProperties.service.js
// getResidentialProperties.service.js
// requestProperty.service.js
// getProperty.service.js
