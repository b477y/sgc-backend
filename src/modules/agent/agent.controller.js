import { Router } from "express";
import * as agentService from "./services/agent.service.js";

const router = Router();

router.get("/listing", agentService.getAgents);
router.get("/profile", agentService.getAgentProfile);
router.get("/properties", agentService.getPropertiesByAgent);

export default router;
