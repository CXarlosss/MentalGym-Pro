// src/controllers/cognitive/exerciseController.js
import Exercise from '../../models/cognitive/Exercise.js';

// GET /api/cognitive/exercises
export const getExercises = async (_req, res) => {
  try {
    const items = await Exercise.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (error) {
    console.error('[cog.getExercises]', error);
    res.status(500).json({ message: 'Error al obtener ejercicios', error });
  }
};

// GET /api/cognitive/exercises/:idOrSlug
export const getExerciseByIdOrSlug = async (req, res) => {
  const { idOrSlug } = req.params;
  try {
    let item = null;
    // intenta por ObjectId
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      item = await Exercise.findById(idOrSlug).lean();
    }
    // o por slug
    if (!item) {
      item = await Exercise.findOne({ slug: idOrSlug }).lean();
    }
    if (!item) return res.status(404).json({ message: 'Ejercicio no encontrado' });
    res.json(item);
  } catch (error) {
    console.error('[cog.getExerciseByIdOrSlug]', error);
    res.status(500).json({ message: 'Error al obtener ejercicio', error });
  }
};

// POST /api/cognitive/exercises
export const createExercise = async (req, res) => {
  const {
    title,
    description = '',
    category,
    difficulty,
    duration = 5,
    instructions = [],
    engine,
    icon,
    slug,
  } = req.body || {};

  if (!title || !category || !difficulty || !engine) {
    return res.status(400).json({
      message: 'title, category, difficulty y engine son obligatorios',
    });
  }

  try {
    if (slug) {
      const dupSlug = await Exercise.findOne({ slug });
      if (dupSlug) return res.status(409).json({ message: 'Slug ya usado' });
    }
    const dupTitle = await Exercise.findOne({ title });
    if (dupTitle) return res.status(409).json({ message: 'Ya existe un ejercicio con ese título' });

    const created = await Exercise.create({
      title, description, category, difficulty, duration, instructions, engine, icon, slug,
    });
    res.status(201).json(created);
  } catch (error) {
    console.error('[cog.createExercise]', error);
    res.status(500).json({ message: 'Error al crear ejercicio', error });
  }
};

// PATCH /api/cognitive/exercises/:id
export const updateExercise = async (req, res) => {
  const { id } = req.params;
  const patch = req.body || {};
  try {
    const updated = await Exercise.findByIdAndUpdate(id, patch, { new: true });
    if (!updated) return res.status(404).json({ message: 'Ejercicio no encontrado' });
    res.json(updated);
  } catch (error) {
    console.error('[cog.updateExercise]', error);
    res.status(500).json({ message: 'Error al actualizar ejercicio', error });
  }
};

// DELETE /api/cognitive/exercises/:id
export const deleteExercise = async (req, res) => {
  const { id } = req.params;
  try {
    const del = await Exercise.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ message: 'Ejercicio no encontrado' });
    res.json({ ok: true });
  } catch (error) {
    console.error('[cog.deleteExercise]', error);
    res.status(500).json({ message: 'Error al eliminar ejercicio', error });
  }
};
