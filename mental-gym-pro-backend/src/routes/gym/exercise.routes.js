import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  listGymExercises, createGymExercise, updateGymExercise, deleteGymExercise
} from '../../controllers/gym/exercise.controller.js';

const r = Router();

r.get('/', listGymExercises);
// protege creación/edición (ajusta si tienes roles)
r.post('/', protect, createGymExercise);
r.patch('/:id', protect, updateGymExercise);
r.delete('/:id', protect, deleteGymExercise);

export default r;
