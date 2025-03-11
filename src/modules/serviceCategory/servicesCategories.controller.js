import { Router } from "express";
import addServiceCategory from "./services/addServiceCategory.service.js";
import getServiceCategories from "./services/getServicesCategories.service.js";

const router = Router();

router.post("", addServiceCategory);
router.get("", getServiceCategories);

export default router;
