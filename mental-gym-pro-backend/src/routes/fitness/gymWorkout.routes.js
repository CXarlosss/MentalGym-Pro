import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  addGymSetToday,
  getGymWorkouts,
  getGymWeeklySummary,
  getGroupVolumeThisWeek
} from '../../controllers/fitness/gymWorkout.controller.js';

const router = Router();

router.post('/sets', protect, addGymSetToday);
router.get('/workouts', protect, getGymWorkouts);
router.get('/weekly-summary', protect, getGymWeeklySummary);
router.get('/group-volume-week', protect, getGroupVolumeThisWeek);

export default router;
