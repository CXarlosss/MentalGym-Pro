// src/controllers/fitness/gymWorkout.controller.js
import GymWorkout from '../../models/fitness/GymWorkout.js';

function toLocalYMD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// POST /api/fitness/gym/sets  (añadir un set al día de hoy)
export const addGymSetToday = async (req, res) => {
  try {
    const user = req.user._id;
    const date = toLocalYMD(new Date());
    const { exercise, weight, reps, tags, marker } = req.body || {};

    if (!reps || reps <= 0) return res.status(400).json({ message: 'reps es obligatorio (>0)' });
    if (weight == null) return res.status(400).json({ message: 'weight es obligatorio' });

    const set = {
      exercise: exercise ?? '',
      weight: Number(weight) || 0,
      reps: Number(reps) || 0,
      tags: Array.isArray(tags) ? tags : [],
      marker: marker ?? 'work',
      createdAt: new Date(),
    };

    const doc = await GymWorkout.findOneAndUpdate(
      { user, date },
      { $setOnInsert: { user, date }, $push: { sets: set } },
      { new: true, upsert: true }
    );

    res.status(201).json(doc);
  } catch (err) {
    console.error('[fitness.addGymSetToday]', err);
    res.status(500).json({ message: 'Error al guardar set' });
  }
};

// GET /api/fitness/gym/workouts
export const getGymWorkouts = async (req, res) => {
  try {
    const docs = await GymWorkout
      .find({ user: req.user._id })
      .sort({ date: -1 })
      .lean();
    res.json(docs);
  } catch (err) {
    console.error('[fitness.getGymWorkouts]', err);
    res.status(500).json({ message: 'Error al listar workouts' });
  }
};

// GET /api/fitness/gym/weekly-summary
export const getGymWeeklySummary = async (req, res) => {
  try {
    const user = req.user._id;
    const keys = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      keys.push(toLocalYMD(d));
    }

    const docs = await GymWorkout.find({ user, date: { $in: keys } }).lean();
    const map = new Map(keys.map(k => [k, { totalSets: 0, totalVolume: 0 }]));

    for (const w of docs) {
      const slot = map.get(w.date);
      if (!slot) continue;
      const totalSets = (w.sets || []).length;
      const totalVolume = (w.sets || []).reduce((a, s) => a + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
      slot.totalSets += totalSets;
      slot.totalVolume += totalVolume;
    }

    const last7Days = keys.map(k => ({ date: k, ...map.get(k) }));
    const totalVolume = last7Days.reduce((a, d) => a + d.totalVolume, 0);

    let topVolumeDay = null;
    for (const d of last7Days) {
      if (!topVolumeDay || d.totalVolume > topVolumeDay.totalVolume) {
        topVolumeDay = { date: d.date, totalVolume: d.totalVolume };
      }
    }

    let streak = 0;
    for (let i = last7Days.length - 1; i >= 0; i--) {
      if (last7Days[i].totalSets > 0) streak++; else break;
    }

    res.json({ last7Days, totalVolume, topVolumeDay, streak });
  } catch (err) {
    console.error('[fitness.getGymWeeklySummary]', err);
    res.status(500).json({ message: 'Error al obtener resumen semanal' });
  }
};

// GET /api/fitness/gym/group-volume-week
export const getGroupVolumeThisWeek = async (req, res) => {
  try {
    const user = req.user._id;
    const keys = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      keys.push(toLocalYMD(d));
    }

    const docs = await GymWorkout.find({ user, date: { $in: keys } }).lean();
    const groupCounts = new Map();

    for (const w of docs) {
      for (const s of (w.sets || [])) {
        if (s.marker === 'warmup') continue;
        for (const t of (s.tags || [])) {
          groupCounts.set(t, (groupCounts.get(t) || 0) + 1);
        }
      }
    }

    const result = Array.from(groupCounts.entries()).map(([group, sets]) => ({ group, sets }));
    res.json(result);
  } catch (err) {
    console.error('[fitness.getGroupVolumeThisWeek]', err);
    res.status(500).json({ message: 'Error al obtener volumen por grupo' });
  }
};
