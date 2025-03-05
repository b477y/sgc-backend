import { Router } from "express";
import getAmenities from "./services/getAmenities.service.js";
import getPropertyCategories from "./services/getPropertyCategories.service.js";

const router = Router();

router.get("/amenities", getAmenities);
router.get("/categories", getPropertyCategories);

export default router;
