// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Rutas...
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

/* =========================
 * CORS
 * ========================= */
const allowed = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN || '', // ⚠️ sin barra final, sin \n
].map(s => s.trim()).filter(Boolean);

// Ayuda a caches/CDN a diferenciar por Origin
app.use((req, res, next) => {
  res.header('Vary', 'Origin');
  next();
});

const corsOptions = {
  origin(origin, cb) {
    // Permite llamadas sin Origin (curl/Postman) y orígenes en lista blanca
    if (!origin || allowed.includes(origin)) return cb(null, true);

    // (opcional) permitir cualquier *.netlify.app
    try {
      const { hostname } = new URL(origin);
      if (hostname.endsWith('.netlify.app')) return cb(null, true);
    } catch {
      // ignore
    }
    return cb(new Error('CORS blocked'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // ❌ NO pongas allowedHeaders como función; no hace falta
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// ❌ IMPORTANTE: quitar cualquier app.options(...) con patrones raros
// app.options('/api/:path(*)', cors(corsOptions)); // <- QUITAR

/* =========================
 * Middlewares base
 * ========================= */
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl} origin=${req.headers.origin || 'n/a'}`);
  next();
});

/* =========================
 * Salud / Health
 * ========================= */
app.get('/', (_req, res) => res.send('🔥 MentalGym Pro Backend en marcha'));
app.get('/api/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

/* =========================
 * API
 * ========================= */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cognitive/exercises', cognitiveExerciseRoutes);
app.use('/api/cognitive/sessions', cognitiveSessionRoutes);
app.use('/api/mental', mentalRoutes);
app.use('/api/gamification/challenges', challengeRoutes);
app.use('/api/gamification/badges', badgeRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/nutrition/foods', foodRoutes);
app.use('/api/nutrition/meals', mealRoutes);
app.use('/api/nutrition/targets', targetRoutes);
app.use('/api/gym/exercises', gymExerciseRoutes);
app.use('/api/gym/workouts', gymWorkoutRoutes);
app.use('/api/stats', statsRoutes);

/* =========================
 * Error CORS explícito (antes del 404)
 * ========================= */
app.use((err, req, res, next) => {
  if (err && err.message === 'CORS blocked') {
    return res.status(403).json({
      success: false,
      message: 'CORS blocked',
      origin: req.headers.origin || null,
      allowed,
    });
  }
  return next(err);
});

/* =========================
 * 404 & Manejo errores
 * ========================= */
app.use(notFound);
app.use(errorHandler);

/* =========================
 * Arrancar
 * ========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log('CORS allowed:', allowed);
});
