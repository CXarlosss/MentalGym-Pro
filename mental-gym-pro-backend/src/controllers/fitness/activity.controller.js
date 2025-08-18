// src/controllers/fitness/activity.controller.js
import ActivityDay from '../../models/fitness/ActivityDay.js';

// helper: YYYY-MM-DD en local
function toLocalYMD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// GET /api/fitness/activity/week
export const getWeeklyActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    // construir las 7 fechas (incluye hoy)
    const keys = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      keys.push(toLocalYMD(d));
    }

    const docs = await ActivityDay.find({ user: userId, date: { $in: keys } }).lean();

    const map = new Map(docs.map(d => [d.date, d]));
    const last7Days = keys.map(k => ({
      date: k,
      steps: map.get(k)?.steps ?? 0,
    }));

    const totalSteps = last7Days.reduce((a, d) => a + d.steps, 0);
    const avgSteps = Math.round(totalSteps / 7);

    let bestDay = null;
    for (const d of last7Days) {
      if (!bestDay || d.steps > bestDay.steps) bestDay = { date: d.date, steps: d.steps };
    }

    let streak = 0;
    for (let i = last7Days.length - 1; i >= 0; i--) {
      if (last7Days[i].steps > 0) streak++; else break;
    }

    res.json({ totalSteps, avgSteps, bestDay, streak, last7Days });
  } catch (err) {
    console.error('[fitness.getWeeklyActivity]', err);
    res.status(500).json({ message: 'Error al obtener actividad semanal' });
  }
};

// PUT /api/fitness/activity/today
export const upsertTodayActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const date = toLocalYMD(new Date());
    const { steps, minutes, calories, note } = req.body || {};

    const payload = {
      user: userId,
      date,
      steps: Math.max(0, Math.floor(Number(steps) || 0)),
      minutes: minutes ?? null,
      calories: calories ?? null,
      note: note ?? '',
    };

    const doc = await ActivityDay.findOneAndUpdate(
      { user: userId, date },
      { $set: payload },
      { new: true, upsert: true }
    );

    res.json(doc);
  } catch (err) {
    console.error('[fitness.upsertTodayActivity]', err);
    res.status(500).json({ message: 'Error al guardar actividad' });
  }
};

// GET /api/fitness/activity
export const listActivity = async (req, res) => {
  try {
    const docs = await ActivityDay
      .find({ user: req.user._id })
      .sort({ date: -1 })
      .lean();
    res.json(docs);
  } catch (err) {
    console.error('[fitness.listActivity]', err);
    res.status(500).json({ message: 'Error al listar actividad' });
  }
};
