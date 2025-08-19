import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  listMyMeals, createMeal, updateMeal, deleteMeal,
  getDailySummary, getWeekSummary
} from '../../controllers/nutrition/meal.controller.js';

const r = Router();
r.use(protect); // todo lo de meals es del usuario autenticado

r.get('/', listMyMeals);
r.post('/', createMeal);
r.patch('/:id', updateMeal);
r.delete('/:id', deleteMeal);

// Resúmenes
r.get('/summary/daily', getDailySummary);
r.get('/summary/week', getWeekSummary);

export default r;
