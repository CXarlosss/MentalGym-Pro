// src/controllers/stats.controller.js
import ExerciseSession from '../models/cognitive/ExerciseSession.js'; // ajusta la ruta si difiere

// helper: YYYY-MM-DD local
function toLocalYMD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// GET /api/stats/me   (alias: /stats/me)
export const getMyStats = async (req, res) => {
  try {
    const user = req.user._id;

    // ventana últimos 7 días (incluye hoy)
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    // 1) Sesiones de la última semana (por día)
    // consideramos la fecha de "actividad" como completedAt si existe, si no playedAt
    const recent = await ExerciseSession.find({
      user,
      $or: [
        { completedAt: { $gte: start, $lte: end } },
        { completedAt: { $exists: false }, playedAt: { $gte: start, $lte: end } },
      ],
    })
      .select('score completedAt playedAt')
      .lean();

    // construye claves de los 7 días (orden cronológico: más antiguo → hoy)
    const keys = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      d.setHours(0, 0, 0, 0);
      keys.push(toLocalYMD(d));
    }

    // cuenta sesiones por día
    const counts = new Map(keys.map(k => [k, 0]));
    for (const s of recent) {
      const when = s.completedAt ?? s.playedAt ?? null;
      if (!when) continue;
      const key = toLocalYMD(new Date(when));
      if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
    }
    const weeklyData = keys.map(k => counts.get(k) || 0);

    // streak: días consecutivos (empezando por hoy) con al menos 1 sesión
    let streak = 0;
    for (let i = weeklyData.length - 1; i >= 0; i--) {
      if (weeklyData[i] > 0) streak++;
      else break;
    }

    // 2) Totales y media de puntuación (toda la historia)
    const [totCount, scoreAgg] = await Promise.all([
      ExerciseSession.countDocuments({ user }),
      ExerciseSession.aggregate([
        { $match: { user } },
        { $match: { score: { $type: 'number' } } },
        {
          $group: {
            _id: null,
            avg: { $avg: '$score' },
          },
        },
        { $project: { _id: 0, avg: 1 } },
      ]),
    ]);

    const averageScore = scoreAgg?.[0]?.avg ? Math.round(scoreAgg[0].avg) : 0;

    return res.json({
      weeklyData,            // number[7] -> sesiones/día (oldest→newest)
      streak,                // días consecutivos con ≥1 sesión
      totalExercises: totCount,
      averageScore,
    });
  } catch (err) {
    console.error('[stats.getMyStats]', err);
    return res.status(500).json({ message: 'Error fetching stats' });
  }
};
