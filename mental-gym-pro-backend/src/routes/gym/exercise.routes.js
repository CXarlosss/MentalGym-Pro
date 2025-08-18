import { Router } from 'express';
import { getGymExercises, createGymExercise } from '../../controllers/gym/exercise.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();

router.get('/', getGymExercises);
router.post('/', protect, createGymExercise);

export default router;
