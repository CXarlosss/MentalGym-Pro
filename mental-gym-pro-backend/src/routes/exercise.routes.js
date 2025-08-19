/* import express from "express";
import {
  getExercises,
  createExercise,
} from "../controllers/exercise.controller.js";
import {protect} from "../middleware/auth.js";

const router = express.Router();

router.get("/", getExercises);
router.post("/", protect, createExercise); // puedes hacer un middleware de "isAdmin" si quieres limitar más

export default router;
 */