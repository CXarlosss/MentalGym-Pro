import express from "express";
import {
  getMyProfile,
  updateProfile,
  toggleFollowUser,
  getUserById,
} from "../controllers/user.controller.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Rutas protegidas
router.get("/me", protect, getMyProfile);
router.put("/update-profile", protect, updateProfile);
router.post("/follow/:id", protect, toggleFollowUser);

// Ruta pública
router.get("/:id", getUserById);

export default router;
