import { Router } from "express";
import { classifyZone } from "../controllers/zoneController";

const router = Router();

// No requireAuth — zoning data is public information
router.get("/", classifyZone);

export default router;
