import { Router } from "express";
import {
  fileValidations,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";
import authentication from "../../middlewares/authentication.middleware.js";
import * as serviceProviderService from "./services/serviceProvider.service.js";
import authorization from "../../middlewares/authorization.middleware.js";
import { UserRole } from "../../utils/enum/enums.js";
const router = Router();

router.post(
  "",
  authentication(),
  authorization(UserRole.ADMIN),
  uploadCloudFile(fileValidations.image).fields([
    { name: "logo", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  serviceProviderService.addServiceProvider
);

router.get("/", serviceProviderService.getAllServiceProviders);

router.get(
  "/by-category",
  serviceProviderService.getServiceProvidersByCategory
);

router.get(
  "/:serviceProviderId",
  serviceProviderService.getServiceProviderById
);

export default router;
