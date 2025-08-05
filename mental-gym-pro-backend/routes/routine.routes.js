import express from "express";
import {
  getPublicRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} from "../controllers/routine.controller.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Rutas públicas
router.get("/public", getPublicRoutines);
router.get("/:id", getRoutineById);

// Rutas privadas
router.post("/", protect, createRoutine);
router.put("/:id", protect, updateRoutine);
router.delete("/:id", protect, deleteRoutine);

export default router;
