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

// POST /api/cognitive/sessions/:sessionId/complete
export const completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { score = 0, timeSpent = 0, metadata = {} } = req.body || {};

    const updated = await ExerciseSession.findOneAndUpdate(
      { _id: sessionId, user: req.user._id },
      {
        $set: {
          score: Number(score) || 0,
          timeSpentSec: Number(timeSpent) || 0,
          metadata,
          completedAt: new Date(),
        },
      },
      { new: true }
    ).populate('exercise', 'title category difficulty');

    if (!updated) {
      return res.status(404).json({ message: 'Sesión no encontrada' });
    }

    // Respuesta compatible con el front
    return res.json({
      _id: updated._id,
      sessionId: updated._id,
      score: updated.score ?? 0,
      timeSpent: updated.timeSpentSec ?? 0,
      createdAt: updated.completedAt ?? updated.playedAt,
      metadata: updated.metadata ?? {},
    });
  } catch (error) {
    console.error('[cog.completeSession]', error);
    res.status(500).json({ message: 'Error al completar sesión', error });
  }
};
