// src/controllers/cognitive/exercise.controller.js
import Exercise from '../../models/cognitive/Exercise.js';
import slugify from 'slugify';

const isValidObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(v);
const makeSlug = (s) => slugify(s, { lower: true, strict: true, trim: true });

// GET /api/cognitive/exercises
export const getExercises = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, difficulty, q } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (q) filter.title = { $regex: q, $options: 'i' };

    const [items, total] = await Promise.all([
      Exercise.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Exercise.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('[cog.getExercises]', error);
    res.status(500).json({ message: 'Error al obtener ejercicios' });
  }
};

// GET /api/cognitive/exercises/:idOrSlug
export const getExerciseByIdOrSlug = async (req, res) => {
  const { idOrSlug } = req.params;
  try {
    let item = null;
    if (isValidObjectId(idOrSlug)) {
      item = await Exercise.findById(idOrSlug).lean();
    }
    if (!item) item = await Exercise.findOne({ slug: idOrSlug }).lean();
    if (!item) return res.status(404).json({ message: 'Ejercicio no encontrado' });
    res.json(item);
  } catch (error) {
    console.error('[cog.getExerciseByIdOrSlug]', error);
    res.status(500).json({ message: 'Error al obtener ejercicio' });
  }
};

// POST /api/cognitive/exercises
export const createExercise = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      duration = 5,
      instructions = [],
      engine,
      icon,
      slug,
    } = req.body || {};

    if (!title || !category || !difficulty || !engine) {
      return res.status(400).json({ message: 'title, category, difficulty y engine son obligatorios' });
    }

    const data = {
      title,
      description,
      category,
      difficulty,
      duration,
      instructions,
      engine,
      icon,
      slug: slug ? makeSlug(slug) : makeSlug(title),
    };

    const created = await Exercise.create(data);
    res.status(201).json(created);
  } catch (error) {
    console.error('[cog.createExercise]', error);
    if (error?.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'campo';
      return res.status(409).json({ message: `Valor duplicado en ${field}` });
    }
    res.status(500).json({ message: 'Error al crear ejercicio' });
  }
};

// PATCH /api/cognitive/exercises/:id
export const updateExercise = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ message: 'ID inválido' });

  try {
    const patch = { ...req.body };
    if (patch.slug) patch.slug = makeSlug(patch.slug);
    if (!patch.slug && patch.title) patch.slug = makeSlug(patch.title);

    const updated = await Exercise.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Ejercicio no encontrado' });
    res.json(updated);
  } catch (error) {
    console.error('[cog.updateExercise]', error);
    if (error?.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'campo';
      return res.status(409).json({ message: `Valor duplicado en ${field}` });
    }
    res.status(500).json({ message: 'Error al actualizar ejercicio' });
  }
};

// DELETE /api/cognitive/exercises/:id
export const deleteExercise = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ message: 'ID inválido' });

  try {
    const del = await Exercise.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ message: 'Ejercicio no encontrado' });
    res.json({ ok: true, id });
  } catch (error) {
    console.error('[cog.deleteExercise]', error);
    res.status(500).json({ message: 'Error al eliminar ejercicio' });
  }
};
