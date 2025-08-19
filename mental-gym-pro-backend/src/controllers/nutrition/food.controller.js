// src/controllers/nutrition/food.controller.js
import FoodItem from '../../models/nutrition/FoodItem.js';

// GET /api/nutrition/foods?q=manza
export const listFoods = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = { };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { tags: { $elemMatch: { $regex: q, $options: 'i' } } },
      ];
    }
    const items = await FoodItem.find(filter).sort({ name: 1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar alimentos', error: err });
  }
};

// GET /api/nutrition/foods/:id
export const getFoodById = async (req, res) => {
  try {
    const doc = await FoodItem.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Alimento no encontrado' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener alimento', error: err });
  }
};

// POST /api/nutrition/foods
export const createFood = async (req, res) => {
  try {
    const { name, kcal, protein, carbs, fat, unit, tags } = req.body || {};
    if (!name || !unit) return res.status(400).json({ message: 'name y unit son obligatorios' });

    const dup = await FoodItem.findOne({ name });
    if (dup) return res.status(409).json({ message: 'Ya existe un alimento con ese nombre' });

    const created = await FoodItem.create({
      name,
      kcal: Number(kcal) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      unit, // '100g' | 'unidad' | 'ml'...
      tags: Array.isArray(tags) ? tags : [],
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear alimento', error: err });
  }
};

// PATCH /api/nutrition/foods/:id
export const updateFood = async (req, res) => {
  try {
    const updated = await FoodItem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body || {} },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Alimento no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar alimento', error: err });
  }
};

// DELETE /api/nutrition/foods/:id   (hard delete)
export const deleteFood = async (req, res) => {
  try {
    const deleted = await FoodItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Alimento no encontrado' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar alimento', error: err });
  }
};
