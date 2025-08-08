import express from "express";
import {
  getDailyChallenge,
  checkChallengeAnswer,
} from "../controllers/mental.controller.js";

const router = express.Router();

router.get("/daily", getDailyChallenge);
router.post("/check", checkChallengeAnswer);

export default router;
