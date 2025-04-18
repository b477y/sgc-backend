import { Router } from "express";
import * as agencyService from "./services/agencies.service.js";
import authorization from "../../middlewares/authorization.middleware.js";
import { UserRole } from "../../utils/enum/enums.js";
import authentication from "../../middlewares/authentication.middleware.js";
import {
  fileValidations,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";

const router = Router();

router.get("/listing", agencyService.getAgencies);
router.get("/", agencyService.getAgencyDetails);
router.get("/properties", agencyService.getAgencyProperties);

router.post(
  "/",
  authentication(),
  authorization(UserRole.ADMIN),
  uploadCloudFile(fileValidations.image).fields([
    { name: "logo", maxCount: 1 },
  ]),
  agencyService.createAgencyWithOwner
);

router.post(
  "/add-agent",
  authentication(),
  authorization(UserRole.AGENCY_OWNER),
  agencyService.addAgent
);

export default router;
