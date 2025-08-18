// src/controllers/cognitive/sessionController.js
import ExerciseSession from '../../models/cognitive/ExerciseSession.js';

// GET /api/cognitive/sessions (del usuario)
export const getMySessions = async (req, res) => {
  try {
    const sessions = await ExerciseSession
      .find({ user: req.user._id })
      .populate('exercise', 'title category difficulty')
      .sort({ playedAt: -1 })
      .lean();
    res.json(sessions);
  } catch (error) {
    console.error('[cog.getMySessions]', error);
    res.status(500).json({ message: 'Error al obtener sesiones', error });
  }
};

// POST /api/cognitive/sessions
export const createSession = async (req, res) => {
  try {
    const { exerciseId, score = 0, durationMin = 0, timeSpentSec, playedAt } = req.body || {};
    if (!exerciseId) return res.status(400).json({ message: 'exerciseId es requerido' });

    const session = await ExerciseSession.create({
      user: req.user._id,
      exercise: exerciseId,
      score: Number(score) || 0,
      durationMin: Number(durationMin) || 0,
      timeSpentSec: Number(timeSpentSec) || 0,
      playedAt: playedAt ? new Date(playedAt) : new Date(),
      metadata: {},
    });

    const populated = await session.populate('exercise', 'title category difficulty');
    res.status(201).json(populated);
  } catch (error) {
    console.error('[cog.createSession]', error);
    res.status(500).json({ message: 'Error al crear sesión', error });
  }
};
