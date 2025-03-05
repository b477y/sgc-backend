import { Router } from "express";
import addProperty from "./services/addProperty.service.js";
import getProperties from "./services/getProperty.service.js";

const router = Router();

router.post("", addProperty);
router.get("", getProperties);

export default router;
