import express from "express";
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

const router = express.Router();

// router.post("/", authorizeRoles("Agent", "User"), addProperty);
// // Both agents and normal users can add properties

router.get("/agency/:agencyId", agencyService.getAgencyProperties);
// Normal users can view agency properties

router.post(
  "/agency",
  authentication(),
  authorization(UserRole.ADMIN),
  uploadCloudFile(fileValidations.image).fields([
    { name: "logo", maxCount: 1 },
  ]),
  agencyService.createAgencyWithOwner
);
// Only admins can add agencies with owners

// router.post(
//   "/create-agency-with-owner",
//   authentication(),
//   authorization(UserRole.ADMIN),
//   agencyService.createAgencyWithOwner
// );

router.post(
  "/agency/:agencyId/agent",
  authentication(),
  authorization(UserRole.AGENCY_OWNER),
  uploadCloudFile(fileValidations.image).fields([
    { name: "logo", maxCount: 1 },
  ]),
  agencyService.addAgent
);
// Only agency owner able to add agents

export default router;
