import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';

// Middlewares propios (si los usas)
import { notFound, errorHandler } from './middleware/errorHandler.js';

// ===== Rutas =====
// Auth & User
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';

// Cognitivo (ejercicios mentales + sesiones)
import cognitiveExerciseRoutes from './routes/cognitive/exercise.routes.js';
import cognitiveSessionRoutes from './routes/cognitive/session.routes.js';

// Mental challenges (tipo Q/A)
import mentalRoutes from './routes/mental.routes.js';

// Gamificación (retos y badges)
import challengeRoutes from './routes/gamification/challenge.routes.js';
import badgeRoutes from './routes/gamification/badge.routes.js';

// Nutrición
import foodRoutes from './routes/nutrition/food.routes.js';
import mealRoutes from './routes/nutrition/meal.routes.js';
import targetRoutes from './routes/nutrition/target.routes.js';

// Gym (catálogo) + Workouts (sets del usuario)
import gymExerciseRoutes from './routes/gym/exercise.routes.js';
import gymWorkoutRoutes from './routes/gym/workout.routes.js';

dotenv.config();
connectDB();

const app = express();

// ===== Middlewares base =====
app.use(cors());               // configura origin si lo necesitas
app.use(express.json());
app.use(morgan('dev'));

// Salud
app.get('/', (_req, res) => {
  res.send('🔥 MentalGym Pro Backend en marcha');
});

// ===== Montaje de rutas “oficiales” =====
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/cognitive/exercises', cognitiveExerciseRoutes);
app.use('/api/cognitive/sessions', cognitiveSessionRoutes);

app.use('/api/mental', mentalRoutes);

app.use('/api/gamification/challenges', challengeRoutes);
app.use('/api/gamification/badges', badgeRoutes);

// Alias de compatibilidad (tu frontend espera /api/challenges/active, etc.)
app.use('/api/challenges', challengeRoutes);

app.use('/api/nutrition/foods', foodRoutes);
app.use('/api/nutrition/meals', mealRoutes);
app.use('/api/nutrition/targets', targetRoutes);

app.use('/api/gym/exercises', gymExerciseRoutes);
app.use('/api/gym/workouts', gymWorkoutRoutes);

// ===== 404 & errores =====
app.use(notFound);     // si no lo tienes, deja un 404 simple
app.use(errorHandler); // idem: captura errores y responde JSON

// ===== Arrancar servidor =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
