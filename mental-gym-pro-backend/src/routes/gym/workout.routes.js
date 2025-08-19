import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  listMyWorkouts,
  addSetToday,
  updateSet,
  deleteSet,
  weekSummary,
  groupsThisWeek
} from '../../controllers/gym/workout.controller.js';

const r = Router();
r.use(protect);

r.get('/', listMyWorkouts);
r.post('/sets', addSetToday);
r.patch('/:workoutId/sets/:setId', updateSet);
r.delete('/:workoutId/sets/:setId', deleteSet);

// resúmenes
r.get('/summary/week', weekSummary);
r.get('/groups/week', groupsThisWeek);

export default r;
