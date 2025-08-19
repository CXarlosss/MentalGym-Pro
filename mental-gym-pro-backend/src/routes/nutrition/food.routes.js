import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  listFoods, getFoodById, createFood, updateFood, deleteFood
} from '../../controllers/nutrition/food.controller.js';

const r = Router();
r.get('/', listFoods);
r.get('/:id', getFoodById);

// Admin/privado (ajusta middleware si tienes roles)
r.post('/', protect, createFood);
r.patch('/:id', protect, updateFood);
r.delete('/:id', protect, deleteFood);

export default r;
