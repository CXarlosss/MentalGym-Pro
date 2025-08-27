// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';

// Middlewares propios
import { notFound, errorHandler } from './middleware/errorHandler.js';

// ===== Rutas =====
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user/user.routes.js';
import cognitiveExerciseRoutes from './routes/cognitive/exercise.routes.js';
import cognitiveSessionRoutes from './routes/cognitive/session.routes.js';
import mentalRoutes from './routes/cognitive/mental.routes.js';
import challengeRoutes from './routes/gamification/challenge.routes.js';
import badgeRoutes from './routes/gamification/badge.routes.js';
import foodRoutes from './routes/nutrition/food.routes.js';
import mealRoutes from './routes/nutrition/meal.routes.js';
import targetRoutes from './routes/nutrition/target.routes.js';
import gymExerciseRoutes from './routes/gym/exercise.routes.js';
import gymWorkoutRoutes from './routes/gym/workout.routes.js';
import statsRoutes from './routes/stats.routes.js';

dotenv.config();
await connectDB();

const app = express();

// ===== Middlewares base =====
const allowed = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN, // p.ej. https://tu-sitio.netlify.app en prod
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => (!origin || allowed.includes(origin) ? cb(null, true) : cb(new Error('CORS blocked'))),
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ===== Salud =====
app.get('/', (_req, res) => res.send('🔥 MentalGym Pro Backend en marcha'));
app.get('/api/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

// ===== Montaje de rutas API =====
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/cognitive/exercises', cognitiveExerciseRoutes);
app.use('/api/cognitive/sessions', cognitiveSessionRoutes);

app.use('/api/mental', mentalRoutes);

app.use('/api/gamification/challenges', challengeRoutes);
app.use('/api/gamification/badges', badgeRoutes);
app.use('/api/challenges', challengeRoutes); // alias compatibilidad

app.use('/api/nutrition/foods', foodRoutes);
app.use('/api/nutrition/meals', mealRoutes);
app.use('/api/nutrition/targets', targetRoutes);

app.use('/api/gym/exercises', gymExerciseRoutes);
app.use('/api/gym/workouts', gymWorkoutRoutes);

app.use('/api/stats', statsRoutes); // <- ahora SÍ montado antes del 404

// ===== 404 & errores =====
app.use(notFound);
app.use(errorHandler);

// ===== Arrancar servidor =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
