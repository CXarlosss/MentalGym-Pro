/* import ExerciseSession from "../models/cognitive/ExerciseSession.js";

// GET /api/sessions  (devuelve las sesiones del usuario autenticado)
export const getMySessions = async (req, res) => {
  try {
    const sessions = await ExerciseSession
      .find({ user: req.user._id })
      .populate("exercise", "name muscleGroup")
      .sort({ playedAt: -1 });
    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener sesiones", error: err });
  }
};

// POST /api/sessions  (crear una sesión al completar un ejercicio)
export const createSession = async (req, res) => {
  try {
    const { exerciseId, score, durationMin, playedAt } = req.body;
    if (!exerciseId) return res.status(400).json({ message: "exerciseId es requerido" });

    const session = await ExerciseSession.create({
      user: req.user._id,
      exercise: exerciseId,
      score: Number(score) || 0,
      durationMin: Number(durationMin) || 0,
      playedAt: playedAt ? new Date(playedAt) : new Date(),
    });

    const populated = await session.populate("exercise", "name muscleGroup");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Error al crear sesión", error: err });
  }
};
 */