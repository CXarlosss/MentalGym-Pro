// src/controllers/cognitive/exerciseController.js
import mongoose from 'mongoose';
import CognitiveExercise from '../../models/cognitive/Exercise.js';

const { isValidObjectId } = mongoose;
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const CATEGORIES = ['memoria','logica','atencion','calculo','velocidad','flexibilidad'];
const ENGINES = ['reaction-speed','memory-pairs','logic-seq','attention-selective','mental-math','cognitive-flex'];

const makeSlug = (s='') =>
  s.toString().trim().toLowerCase()
   .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .replace(/[^a-z0-9]+/g,'-')
   .replace(/(^-|-$)+/g,'');

// GET /api/cognitive/exercises
export const getExercises = async (req, res) => {
  try {
    const { category, difficulty, q, sort='newest', page=1, limit=50 } = req.query;
    const query = {};
    if (category && CATEGORIES.includes(String(category))) query.category = category;
    if (difficulty && DIFFICULTIES.includes(String(difficulty))) query.difficulty = difficulty;
    if (q) {
      const rx = new RegExp(String(q).trim(), 'i');
      query.$or = [{ title: rx }, { description: rx }];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'title') sortObj = { title: 1 };
    if (sort === 'difficulty') sortObj = { difficulty: 1, createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page,10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit,10) || 50));

    const [items, total] = await Promise.all([
      CognitiveExercise.find(query).sort(sortObj).skip((pageNum-1)*limitNum).limit(limitNum).lean(),
      CognitiveExercise.countDocuments(query),
    ]);

    res.json({ items, total, page: pageNum, pages: Math.ceil(total/limitNum) });
  } catch (error) {
    console.error('[cognitive.getExercises]', error);
    res.status(500).json({ message: 'Error al obtener ejercicios' });
  }
};

// GET /api/cognitive/exercises/:idOrSlug
export const getExerciseByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const byId = isValidObjectId(idOrSlug) ? await CognitiveExercise.findById(idOrSlug) : null;
    const ex = byId || await CognitiveExercise.findOne({ slug: idOrSlug });
    if (!ex) return res.status(404).json({ message: 'Ejercicio no encontrado' });
    res.json(ex);
  } catch (error) {
    console.error('[cognitive.getExerciseByIdOrSlug]', error);
    res.status(500).json({ message: 'Error al obtener el ejercicio' });
  }
};

// POST /api/cognitive/exercises
export const createExercise = async (req, res) => {
  try {
    const { title, description, category, difficulty, duration=5, instructions=[], engine, icon, slug } = req.body || {};
    if (!title || !description || !category || !difficulty || !engine) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    if (!CATEGORIES.includes(category)) return res.status(400).json({ message: 'Categoría inválida' });
    if (!DIFFICULTIES.includes(difficulty)) return res.status(400).json({ message: 'Dificultad inválida' });
    if (!ENGINES.includes(engine)) return res.status(400).json({ message: 'Engine inválido' });

    const finalSlug = slug?.trim() || makeSlug(title);
    const dup = await CognitiveExercise.findOne({ $or: [{ title }, { slug: finalSlug }] });
    if (dup) return res.status(409).json({ message: 'Título o slug ya en uso' });

    const created = await CognitiveExercise.create({
      title, description, category, difficulty, duration, instructions, engine, icon, slug: finalSlug,
    });
    res.status(201).json(created);
  } catch (error) {
    console.error('[cognitive.createExercise]', error);
    res.status(500).json({ message: 'Error al crear ejercicio' });
  }
};

// PATCH /api/cognitive/exercises/:id
export const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'ID inválido' });

    const allowed = ['title','description','category','difficulty','duration','instructions','engine','icon','slug'];
    const update = {};
    for (const k of allowed) if (k in req.body) update[k] = req.body[k];

    if (update.category && !CATEGORIES.includes(update.category)) return res.status(400).json({ message: 'Categoría inválida' });
    if (update.difficulty && !DIFFICULTIES.includes(update.difficulty)) return res.status(400).json({ message: 'Dificultad inválida' });
    if (update.engine && !ENGINES.includes(update.engine)) return res.status(400).json({ message: 'Engine inválido' });
    if (update.slug) update.slug = makeSlug(update.slug);

    if (update.title || update.slug) {
      const or = [];
      if (update.title) or.push({ title: update.title });
      if (update.slug) or.push({ slug: update.slug });
      const dup = await CognitiveExercise.findOne({ $or: or, _id: { $ne: id } });
      if (dup) return res.status(409).json({ message: 'Título o slug ya en uso' });
    }

    const ex = await CognitiveExercise.findByIdAndUpdate(id, update, { new: true });
    if (!ex) return res.status(404).json({ message: 'Ejercicio no encontrado' });
    res.json(ex);
  } catch (error) {
    console.error('[cognitive.updateExercise]', error);
    res.status(500).json({ message: 'Error al actualizar ejercicio' });
  }
};

// DELETE /api/cognitive/exercises/:id
export const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'ID inválido' });
    const ex = await CognitiveExercise.findByIdAndDelete(id);
    if (!ex) return res.status(404).json({ message: 'Ejercicio no encontrado' });
    res.json({ ok: true });
  } catch (error) {
    console.error('[cognitive.deleteExercise]', error);
    res.status(500).json({ message: 'Error al eliminar ejercicio' });
  }
};
