import { Router } from 'express';
import {
  getExercises,
  getExerciseByIdOrSlug,
  createExercise,
  updateExercise,
  deleteExercise,
} from '../../controllers/cognitive/exercise.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();

router.get('/', getExercises);
router.get('/:idOrSlug', getExerciseByIdOrSlug);
router.post('/', protect, createExercise);
router.patch('/:id', protect, updateExercise);
router.delete('/:id', protect, deleteExercise);

export default router;
