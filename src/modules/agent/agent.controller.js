import { Router } from "express";
import * as agentService from "./services/agent.service.js";

const router = Router();

router.get("/listing", agentService.getAgents);
router.get("/profile/:agentId", agentService.getAgentProfile);
router.get("/properties/:agentId", agentService.getPropertiesByAgent);

export default router;
