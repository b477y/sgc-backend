import { Router } from "express";
// import { authorizeRoles } from "../../../middlewares/authentication.middleware.js";
// import addProperty from "../services/addProperty.service.js";
import * as agencyService from "./services/agencies.service.js";
import authorization from "../../middlewares/authorization.middleware.js";
import { UserRole } from "../../utils/enum/enums.js";
import authentication from "../../middlewares/authentication.middleware.js";
import {
  fileValidations,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";

const router = Router();

// get agencies
router.get("/listing", agencyService.getAgencies);

// get agents
router.get("/agents/listing", agencyService.getAgents);

// get agency agents
router.get("/:agencyId", agencyService.getAgencyDetails);

router.get("/:agencyId/properties", agencyService.getAgencyProperties);
// Normal users can view agency properties (done)

router.get("/agent/:agentId", agencyService.getPropertiesByAgent);
// Normal users can view agent properties (done)

router.post(
  "/",
  authentication(),
  authorization(UserRole.ADMIN),
  uploadCloudFile(fileValidations.image).fields([
    { name: "logo", maxCount: 1 },
  ]),
  agencyService.createAgencyWithOwner
);
// Only admins can add agencies with owners

router.post(
  "/:agencyId/add-agent",
  authentication(),
  authorization(UserRole.AGENCY_OWNER),
  agencyService.addAgent
);
// Only admins can add agencies with owners

// 2 endpoints remains


export default router;
