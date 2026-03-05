import { Router } from "express";
import { analyzeProfile } from "../controllers/analyzeController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.post("/:profileId", analyzeProfile);

export default router;
