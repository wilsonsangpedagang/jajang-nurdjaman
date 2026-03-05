import { Router } from "express";
import { body } from "express-validator";
import { createProfile, getProfiles, getProfile, deleteProfile } from "../controllers/businessController";
import { requireAuth } from "../middleware/auth";
import { validateRequest } from "../middleware/validateRequest";

const router = Router();

router.use(requireAuth);

router.get("/", getProfiles);
router.get("/:id", getProfile);
router.delete("/:id", deleteProfile);

router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("category").trim().notEmpty(),
    body("concept").trim().notEmpty(),
    body("products").isArray({ min: 1 }),
    body("goals").isArray({ min: 1 }),
    body("latitude").isFloat({ min: -90, max: 90 }),
    body("longitude").isFloat({ min: -180, max: 180 }),
    body("radiusMeters").isInt({ min: 100, max: 50000 }),
  ],
  validateRequest,
  createProfile
);

export default router;
