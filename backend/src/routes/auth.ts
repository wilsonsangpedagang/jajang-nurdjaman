import { Router } from "express";
import { body } from "express-validator";
import { register, login, getMe } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { validateRequest } from "../middleware/validateRequest";

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("name").trim().notEmpty().withMessage("Name is required"),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validateRequest,
  login
);

router.get("/me", requireAuth, getMe);

export default router;
