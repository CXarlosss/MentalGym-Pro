// src/routes/mental.routes.js
import { Router } from "express";
import {
  listChallenges,
  getRandomChallenge,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} from "../controllers/mental.controller.js";
import { protect } from "../middleware/auth.js";

const r = Router();

// Lectura pública
r.get("/", listChallenges);
r.get("/random", getRandomChallenge);
r.get("/:id", getChallengeById);

// Escritura protegida
r.post("/", protect, createChallenge);
r.patch("/:id", protect, updateChallenge);
r.delete("/:id", protect, deleteChallenge);

export default r;
