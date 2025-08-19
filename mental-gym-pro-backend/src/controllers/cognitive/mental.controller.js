// src/controllers/mental.controller.js
import MentalChallenge from "../../models/cognitive/MentalChallenge.js";

// GET /api/mental   (list + filtros + paginación)
export const listChallenges = async (req, res) => {
  try {
    const { difficulty, type, q, page = 1, limit = 20, active } = req.query;
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    if (active !== undefined) filter.isActive = active === "true";
    if (q) filter.question = { $regex: q, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      MentalChallenge.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      MentalChallenge.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error("[mental.listChallenges]", error);
    res.status(500).json({ message: "Error al listar retos mentales", error });
  }
};

// GET /api/mental/random  (uno aleatorio con filtros opcionales)
export const getRandomChallenge = async (req, res) => {
  try {
    const { difficulty, type } = req.query;
    const match = { isActive: true };
    if (difficulty) match.difficulty = difficulty;
    if (type) match.type = type;

    const [doc] = await MentalChallenge.aggregate([
      { $match: match },
      { $sample: { size: 1 } },
    ]);

    if (!doc) return res.status(404).json({ message: "No hay retos con esos filtros" });
    res.json(doc);
  } catch (error) {
    console.error("[mental.getRandomChallenge]", error);
    res.status(500).json({ message: "Error al obtener reto aleatorio", error });
  }
};

// GET /api/mental/:id
export const getChallengeById = async (req, res) => {
  try {
    const item = await MentalChallenge.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: "Reto mental no encontrado" });
    res.json(item);
  } catch (error) {
    console.error("[mental.getChallengeById]", error);
    res.status(500).json({ message: "Error al obtener reto mental", error });
  }
};

// POST /api/mental
export const createChallenge = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.question || !payload.options || !payload.answer) {
      return res.status(400).json({ message: "question, options y answer son obligatorios" });
    }
    // opcional: asignar autor
    if (req.user?._id) payload.author = req.user._id;

    const created = await MentalChallenge.create(payload);
    res.status(201).json(created);
  } catch (error) {
    console.error("[mental.createChallenge]", error);
    res.status(500).json({ message: "Error al crear reto mental", error });
  }
};

// PATCH /api/mental/:id
export const updateChallenge = async (req, res) => {
  try {
    const updated = await MentalChallenge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Reto mental no encontrado" });
    res.json(updated);
  } catch (error) {
    console.error("[mental.updateChallenge]", error);
    res.status(500).json({ message: "Error al actualizar reto mental", error });
  }
};

// DELETE /api/mental/:id
export const deleteChallenge = async (req, res) => {
  try {
    const del = await MentalChallenge.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: "Reto mental no encontrado" });
    res.json({ ok: true });
  } catch (error) {
    console.error("[mental.deleteChallenge]", error);
    res.status(500).json({ message: "Error al eliminar reto mental", error });
  }
};
