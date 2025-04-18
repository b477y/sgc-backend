import { Router } from "express";
import * as serviceCategoryService from "./services/serviceCategory.service.js";
import authentication from "../../middlewares/authentication.middleware.js";
import authorization from "../../middlewares/authorization.middleware.js";
import { UserRole } from "../../utils/enum/enums.js";
const router = Router();

router.post(
  "",
  authentication(),
  authorization(UserRole.ADMIN),
  serviceCategoryService.addServiceCategory
);

router.get("", serviceCategoryService.getServiceCategories);
router.get("/by-service-id", serviceCategoryService.getServiceProvidersByCategory);

export default router;
