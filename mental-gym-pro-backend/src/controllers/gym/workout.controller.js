// src/controllers/gym/workout.controller.js
import GymWorkout from '../../models/fitness/GymWorkout.js';

/** Devuelve fecha local en formato YYYY-MM-DD */
export const toLocalYMD = (d = new Date()) => {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * GET /api/gym/workouts?from=YYYY-MM-DD&to=YYYY-MM-DD
 * GET /api/gym/workouts?day=YYYY-MM-DD
 */
export const listMyWorkouts = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: 'No autorizado' });

    const user = req.user._id;
    const { day, from, to } = req.query;

    /** @type {{ user: any, date?: any }} */
    const q = { user };

    if (day) {
      q.date = String(day);
    } else if (from && to) {
      q.date = { $gte: String(from), $lte: String(to) };
    }

    const items = await GymWorkout.find(q).sort({ date: -1 }).lean();
    res.json(items);
  } catch (err) {
    console.error('[gym.listMyWorkouts]', err);
    res.status(500).json({ message: 'Error al listar workouts' });
  }
};

/**
 * POST /api/gym/workouts/sets  (añadir set al día actual)
 * body: { exercise, weight, reps, tags?, marker?, rpe?, notes? }
 */
export const addSetToday = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: 'No autorizado' });

    const user = req.user._id;
    const { exercise, weight, reps, tags, marker, rpe, notes } = req.body || {};

    if (!exercise || reps == null || weight == null) {
      return res.status(400).json({ message: 'exercise, weight y reps son obligatorios' });
    }

    const date = toLocalYMD(new Date());
    let doc = await GymWorkout.findOne({ user, date });
    const now = new Date();

    const set = {
      exercise: String(exercise),
      weight: Number(weight) || 0,
      reps: Number(reps) || 0,
      tags: Array.isArray(tags) ? tags : [],
      marker: marker ?? null,           // 'warmup' | null
      rpe: rpe != null ? Number(rpe) : undefined,
      notes: notes ? String(notes) : '',
      createdAt: now,
    };

    if (!doc) {
      doc = await GymWorkout.create({ user, date, sets: [set] });
    } else {
      doc.sets.push(set);
      await doc.save();
    }

    res.status(201).json(doc);
  } catch (err) {
    console.error('[gym.addSetToday]', err);
    res.status(500).json({ message: 'Error al añadir set' });
  }
};

/**
 * PATCH /api/gym/workouts/:workoutId/sets/:setId
 */
export const updateSet = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: 'No autorizado' });

    const user = req.user._id;
    const { workoutId, setId } = req.params;

    const doc = await GymWorkout.findOne({ _id: workoutId, user });
    if (!doc) return res.status(404).json({ message: 'Workout no encontrado' });

    const idx = doc.sets.findIndex((s) => String(s._id) === String(setId));
    if (idx < 0) return res.status(404).json({ message: 'Set no encontrado' });

    // Solo sobreescribe campos válidos si llegan en body
    const { exercise, weight, reps, tags, marker, rpe, notes } = req.body || {};
    if (exercise !== undefined) doc.sets[idx].exercise = String(exercise);
    if (weight !== undefined) doc.sets[idx].weight = Number(weight) || 0;
    if (reps !== undefined) doc.sets[idx].reps = Number(reps) || 0;
    if (tags !== undefined) doc.sets[idx].tags = Array.isArray(tags) ? tags : [];
    if (marker !== undefined) doc.sets[idx].marker = marker ?? null;
    if (rpe !== undefined) doc.sets[idx].rpe = rpe != null ? Number(rpe) : undefined;
    if (notes !== undefined) doc.sets[idx].notes = notes ? String(notes) : '';

    doc.markModified('sets');
    await doc.save();

    res.json(doc);
  } catch (err) {
    console.error('[gym.updateSet]', err);
    res.status(500).json({ message: 'Error al actualizar set' });
  }
};

/**
 * DELETE /api/gym/workouts/:workoutId/sets/:setId
 */
export const deleteSet = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: 'No autorizado' });

    const user = req.user._id;
    const { workoutId, setId } = req.params;

    const doc = await GymWorkout.findOne({ _id: workoutId, user });
    if (!doc) return res.status(404).json({ message: 'Workout no encontrado' });

    const before = doc.sets.length;
    doc.sets = doc.sets.filter((s) => String(s._id) !== String(setId));
    if (doc.sets.length === before) {
      return res.status(404).json({ message: 'Set no encontrado' });
    }

    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error('[gym.deleteSet]', err);
    res.status(500).json({ message: 'Error al eliminar set' });
  }
};

/** @typedef {{ date: string, totalSets: number, totalVolume: number }} DayAgg */

/**
 * GET /api/gym/workouts/summary/week?end=YYYY-MM-DD
 */
export const weekSummary = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: 'No autorizado' });

    const user = req.user._id;
    const end = req.query.end ? new Date(String(req.query.end)) : new Date();

    /** @type {string[]} */
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      days.push(toLocalYMD(d));
    }

    const docs = await GymWorkout.find({ user, date: { $in: days } }).lean();

    /** @type {Map<string, DayAgg>} */
    const map = new Map(days.map((d) => [d, { date: d, totalSets: 0, totalVolume: 0 }]));

    for (const w of docs) {
      const vol = (w.sets || []).reduce(
        (a, s) => a + (Number(s.weight) || 0) * (Number(s.reps) || 0),
        0
      );
      const sets = (w.sets || []).length;
      const agg = map.get(w.date);
      if (agg) {
        agg.totalSets += sets;
        agg.totalVolume += vol;
      }
    }

    const last7Days = days.map((d) => map.get(d) ?? { date: d, totalSets: 0, totalVolume: 0 });
    const totalVolume = last7Days.reduce((a, d) => a + d.totalVolume, 0);

    let topVolumeDay = null;
    for (const d of last7Days) {
      if (!topVolumeDay || d.totalVolume > topVolumeDay.totalVolume) {
        topVolumeDay = { date: d.date, totalVolume: d.totalVolume };
      }
    }

    let streak = 0;
    for (let i = last7Days.length - 1; i >= 0; i--) {
      if (last7Days[i].totalSets > 0) streak++;
      else break;
    }

    res.json({ last7Days, totalVolume, topVolumeDay, streak });
  } catch (err) {
    console.error('[gym.weekSummary]', err);
    res.status(500).json({ message: 'Error en resumen semanal' });
  }
};

/**
 * GET /api/gym/workouts/groups/week
 */
export const groupsThisWeek = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: 'No autorizado' });

    const user = req.user._id;
    const end = new Date();

    /** @type {string[]} */
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      days.push(toLocalYMD(d));
    }

    const docs = await GymWorkout.find({ user, date: { $in: days } }).lean();

    /** @type {Map<string, number>} tag -> sets */
    const counts = new Map();

    for (const w of docs) {
      for (const s of w.sets || []) {
        if (s.marker === 'warmup') continue;
        for (const t of s.tags || []) {
          counts.set(t, (counts.get(t) || 0) + 1);
        }
      }
    }

    const out = Array.from(counts.entries()).map(([group, sets]) => ({ group, sets }));
    res.json(out);
  } catch (err) {
    console.error('[gym.groupsThisWeek]', err);
    res.status(500).json({ message: 'Error en volumen por grupos' });
  }
};
