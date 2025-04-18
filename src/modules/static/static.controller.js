import { Router } from "express";
import * as staticService from "./services/static.service.js";

const router = Router();

router.get("/amenities", staticService.getAmenities);
router.get("/categories/by-category-id", staticService.getCategoryById);
router.get("/categories", staticService.getCategories);
router.get("/cities", staticService.getCities);
router.get("/real-estate-situations", staticService.getRealEstateSituations);

export default router;
