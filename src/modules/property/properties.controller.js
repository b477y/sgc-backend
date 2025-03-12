import { Router } from "express";
import {
  fileValidations,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";
import addProperty from "./services/addProperty.service.js";
import getProperties from "./services/getProperties.service.js";

const router = Router();

router.post(
  "",
  uploadCloudFile(fileValidations.image).fields([
    { name: "images", maxCount: 30 },
  ]),
  addProperty
);

router.get("", getProperties);

export default router;
