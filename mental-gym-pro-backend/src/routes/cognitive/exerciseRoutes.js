// src/routes/cognitive/exerciseRoutes.js
import { Router } from 'express';
import {
  getExercises, getExerciseByIdOrSlug, createExercise, updateExercise, deleteExercise
} from '../../controllers/cognitive/exerciseController.js';
import { protect } from '../../middleware/auth.js';

const r = Router();
r.get('/', getExercises);
r.get('/:idOrSlug', getExerciseByIdOrSlug);
r.post('/', protect, createExercise);
r.patch('/:id', protect, updateExercise);
r.delete('/:id', protect, deleteExercise);
export default r;

// src/routes/cognitive/sessionRoutes.js
import { Router } from 'express';
import { getMySessions, createSession } from '../../controllers/cognitive/sessionController.js';
import { protect } from '../../middleware/auth.js';

const r = Router();
r.get('/', protect, getMySessions);
r.post('/', protect, createSession);
export default r;

// src/routes/gym/exerciseRoutes.js
import { Router } from 'express';
import { getGymExercises, createGymExercise } from '../../controllers/gym/exerciseController.js';
import { protect } from '../../middleware/auth.js';

const r = Router();
r.get('/', getGymExercises);
r.post('/', protect, createGymExercise);
export default r;
