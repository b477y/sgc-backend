import { Router } from "express";
import addServiceCategory from "./services/addServiceCategory.service.js";
import getServiceCategories from "./services/getServicesCategories.service.js";
import getCompaniesByServiceCategory from "./services/getCompaniesByServiceCategory.service.js";

const router = Router();

router.post("", addServiceCategory);
router.get("", getServiceCategories);
router.get("/:serviceId", getCompaniesByServiceCategory);

export default router;
