import { Router } from "express";
import {
  fileValidations,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";
import addServiceProvider from "./services/addServiceProvider.service.js";
import authentication from "../../middlewares/authentication.middleware.js";
import getAllServiceProviders from "./services/getAllServiceProviders.service.js";
import getServiceProviderById from "./services/getServiceProviderById.service.js";
import getServiceProvidersByCategory from "./services/getServiceProvidersByCategory.service.js";
const router = Router();

router.post(
  "",
  uploadCloudFile(fileValidations.image).fields([
    { name: "logo", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  addServiceProvider
);

router.get("/", getAllServiceProviders);

router.get("/by-category", getServiceProvidersByCategory);


router.get("/:serviceProviderId", getServiceProviderById);

export default router;
