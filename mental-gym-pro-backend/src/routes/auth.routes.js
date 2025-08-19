// @ts-nocheck
import express from "express";
import { body, validationResult } from "express-validator";
import { register, login } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
const router = express.Router();

// Ruta: /api/auth/register
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  register
);

// Ruta: /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  login
);

// Ruta protegida: /api/auth/me
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
    },
  });
});

export default router;
