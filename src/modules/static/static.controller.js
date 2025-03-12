import { Router } from "express";
import getAmenities from "./services/getAmenities.service.js";
import getPropertyCategories from "./services/getPropertyCategories.service.js";
import getCities from "./services/getCities.service.js";
import getResidentialFormData from "./services/getResidentialFormData.service.js";
import getCommercialFormData from "./services/getCommercialFormData.service.js";
import getPlotFormData from "./services/getPlotFormData.service.js";

const router = Router();

router.get("/amenities", getAmenities);
router.get("/categories", getPropertyCategories);
router.get("/cities", getCities);
router.get("/form-options/add-residential", getResidentialFormData);
router.get("/form-options/add-commercial", getCommercialFormData);
router.get("/form-options/add-plot", getPlotFormData);

export default router;
