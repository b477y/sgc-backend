import { Router } from "express";
import * as authService from "./services/auth.service.js";
const router = Router();

router.post("/signup", authService.signUp);
router.post("/signin", authService.signIn);
router.get("/refresh-token", authService.refreshToken);

export default router;
