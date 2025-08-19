// src/controllers/gamification/challenge.controller.js
import Challenge from '../../models/gamification/Challenge.js';
import UserChallenge from '../../models/gamification/UserChallenge.js';

// GET /api/challenges/active  (compat)  y /api/gamification/challenges/active
export const getActiveChallenges = async (_req, res) => {
  try {
    const now = new Date();
    const items = await Challenge
      .find({
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gte: now } }],
        isDeleted: { $ne: true },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    console.error('[gamification.getActiveChallenges]', err);
    res.status(500).json({ message: 'Error al obtener desafíos activos' });
  }
};

// GET /api/gamification/challenges
export const listChallenges = async (_req, res) => {
  try {
    const items = await Challenge.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar desafíos' });
  }
};

// GET /api/gamification/challenges/:id
export const getChallengeById = async (req, res) => {
  try {
    const doc = await Challenge.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Desafío no encontrado' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener desafío' });
  }
};

// POST /api/gamification/challenges
export const createChallenge = async (req, res) => {
  try {
    const { title, description, objective, durationDays, exercises, expiresAt } = req.body || {};
    if (!title) return res.status(400).json({ message: 'title es obligatorio' });

    const created = await Challenge.create({
      title,
      description: description ?? '',
      objective: objective ?? '',
      durationDays: durationDays ?? null,
      exercises: Array.isArray(exercises) ? exercises : [],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      participants: 0,
      isCompleted: false,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('[gamification.createChallenge]', err);
    res.status(500).json({ message: 'Error al crear desafío' });
  }
};

// PATCH /api/gamification/challenges/:id
export const updateChallenge = async (req, res) => {
  try {
    const updated = await Challenge.findByIdAndUpdate(
      req.params.id,
      { $set: req.body || {} },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Desafío no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar desafío' });
  }
};

// DELETE /api/gamification/challenges/:id  (soft delete)
export const deleteChallenge = async (req, res) => {
  try {
    const updated = await Challenge.findByIdAndUpdate(
      req.params.id,
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Desafío no encontrado' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar desafío' });
  }
};

// POST /api/gamification/challenges/:id/join
export const joinChallenge = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const user = req.user._id;

    const exists = await UserChallenge.findOne({ user, challenge: challengeId });
    if (exists) return res.status(200).json(exists);

    const uc = await UserChallenge.create({
      user,
      challenge: challengeId,
      progress: 0,
      isCompleted: false,
      joinedAt: new Date(),
    });

    await Challenge.findByIdAndUpdate(challengeId, { $inc: { participants: 1 } }).lean();

    res.status(201).json(uc);
  } catch (err) {
    console.error('[gamification.joinChallenge]', err);
    res.status(500).json({ message: 'Error al unirse al desafío' });
  }
};

// PATCH /api/gamification/challenges/:id/progress
export const updateMyChallengeProgress = async (req, res) => {
  try {
    const challenge = req.params.id;
    const user = req.user._id;
    const { progress, isCompleted } = req.body || {};

    const updated = await UserChallenge.findOneAndUpdate(
      { user, challenge },
      {
        $set: {
          ...(progress != null ? { progress } : {}),
          ...(isCompleted != null ? { isCompleted, completedAt: isCompleted ? new Date() : null } : {}),
        },
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'No estás inscrito en este desafío' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar progreso' });
  }
};

// GET /api/gamification/my-challenges
export const listMyChallenges = async (req, res) => {
  try {
    const docs = await UserChallenge
      .find({ user: req.user._id })
      .populate('challenge')
      .sort({ joinedAt: -1 })
      .lean();

    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar mis desafíos' });
  }
};
