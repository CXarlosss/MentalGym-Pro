// src/routes/stats.routes.js
import { Router } from 'express';
import { getMyStats } from '../controllers/stats.controller.js'; // ajusta ruta si difiere
import { protect } from '../middleware/auth.js';

const router = Router();

// alias para compat con tu front (progress.ts prueba varias rutas)
router.get('/api/stats/me', protect, getMyStats);
router.get('/stats/me', protect, getMyStats);

export default router;
