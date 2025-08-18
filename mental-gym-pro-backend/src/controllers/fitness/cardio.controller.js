// src/controllers/fitness/cardio.controller.js
import CardioEntry from '../../models/fitness/CardioEntry.js';

function toLocalYMD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// POST /api/fitness/cardio
export const addCardioToday = async (req, res) => {
  try {
    const user = req.user._id;
    const date = toLocalYMD(new Date());
    const { minutes, distanceKm, type, note } = req.body || {};

    if (!minutes || minutes <= 0) {
      return res.status(400).json({ message: 'minutes es obligatorio (>0)' });
    }

    const created = await CardioEntry.create({
      user, date,
      minutes,
      distanceKm: distanceKm ?? 0,
      type: type ?? 'other',
      note: note ?? '',
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('[fitness.addCardioToday]', err);
    res.status(500).json({ message: 'Error al registrar cardio' });
  }
};

// GET /api/fitness/cardio
export const listCardio = async (req, res) => {
  try {
    const docs = await CardioEntry
      .find({ user: req.user._id })
      .sort({ date: -1 })
      .lean();
    res.json(docs);
  } catch (err) {
    console.error('[fitness.listCardio]', err);
    res.status(500).json({ message: 'Error al listar cardio' });
  }
};

// GET /api/fitness/cardio/week
export const getCardioWeek = async (req, res) => {
  try {
    const user = req.user._id;

    const keys = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      keys.push(toLocalYMD(d));
    }

    const docs = await CardioEntry.find({ user, date: { $in: keys } }).lean();
    const byDay = new Map();
    for (const k of keys) byDay.set(k, { minutes: 0, distanceKm: 0 });

    for (const c of docs) {
      const slot = byDay.get(c.date);
      if (!slot) continue;
      slot.minutes += c.minutes || 0;
      slot.distanceKm += c.distanceKm || 0;
    }

    const days = keys.map(k => ({ date: k, ...byDay.get(k) }));
    res.json({ days });
  } catch (err) {
    console.error('[fitness.getCardioWeek]', err);
    res.status(500).json({ message: 'Error al obtener cardio semanal' });
  }
};
