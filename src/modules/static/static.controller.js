import { Router } from "express";
import getAmenities from "./services/getAmenities.service.js";
import getCategories from "./services/getCategories.service.js";
import getCities from "./services/getCities.service.js";
import getResidentialFormData from "./services/getResidentialFormData.service.js";
import getCommercialFormData from "./services/getCommercialFormData.service.js";
import getPlotFormData from "./services/getPlotFormData.service.js";
import getRequestPropertyFormData from "./services/getRequestPropertyFormData.service.js";
import getCategoryById from "./services/getCategoryById.service.js";
import getRealEstateSituations from "./services/getRealEstateSituations.service.js";

const router = Router();

router.get("/amenities", getAmenities);
router.get("/categories", getCategories);
router.get("/categories/:categoryId", getCategoryById);
router.get("/cities", getCities);
router.get("/real-estate-situations", getRealEstateSituations);
router.get("/form-options/add-residential", getResidentialFormData);
router.get("/form-options/add-commercial", getCommercialFormData);
router.get("/form-options/add-plot", getPlotFormData);
router.get("/form-options/request-property", getRequestPropertyFormData);

export default router;
