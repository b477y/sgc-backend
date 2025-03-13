import { Router } from "express";
import {
  fileValidations,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";
import addProperty from "./services/addProperty.service.js";
import getProperties from "./services/getProperties.service.js";
import requestProperty from "./services/requestProperty.service.js";
import getProperty from "./services/getProperty.service.js";

const router = Router();

router.post(
  "/",
  uploadCloudFile(fileValidations.image).fields([
    { name: "images", maxCount: 30 },
  ]),
  addProperty
);

router.post("/request-property", requestProperty);

router.get("/", getProperties);
router.get("/:propertyId", getProperty);

export default router;
