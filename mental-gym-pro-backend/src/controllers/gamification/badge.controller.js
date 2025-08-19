// src/controllers/gamification/badge.controller.js
import Badge from '../../models/gamification/Badge.js';
import UserBadge from '../../models/gamification/UserBadge.js';

// GET /api/gamification/badges
export const listBadges = async (_req, res) => {
  try {
    const items = await Badge.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar badges' });
  }
};

// POST /api/gamification/badges
export const createBadge = async (req, res) => {
  try {
    const { code, title, description, icon } = req.body || {};
    if (!code || !title) return res.status(400).json({ message: 'code y title son obligatorios' });

    const dup = await Badge.findOne({ code });
    if (dup) return res.status(409).json({ message: 'Ya existe un badge con ese code' });

    const created = await Badge.create({
      code,
      title,
      description: description ?? '',
      icon: icon ?? '',
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear badge' });
  }
};

// PATCH /api/gamification/badges/:id
export const updateBadge = async (req, res) => {
  try {
    const updated = await Badge.findByIdAndUpdate(req.params.id, { $set: req.body || {} }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Badge no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar badge' });
  }
};

// DELETE /api/gamification/badges/:id (soft delete)
export const deleteBadge = async (req, res) => {
  try {
    const updated = await Badge.findByIdAndUpdate(req.params.id, { $set: { isDeleted: true } }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Badge no encontrado' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar badge' });
  }
};

// GET /api/gamification/user-badges (mis badges)
export const listMyBadges = async (req, res) => {
  try {
    const items = await UserBadge
      .find({ user: req.user._id })
      .populate('badge')
      .sort({ unlockedAt: -1 })
      .lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar mis badges' });
  }
};

// POST /api/gamification/user-badges/:badgeId/unlock
export const unlockBadgeForMe = async (req, res) => {
  try {
    const user = req.user._id;
    const badge = req.params.badgeId;

    const exists = await UserBadge.findOne({ user, badge });
    if (exists) return res.status(200).json(exists);

    const created = await UserBadge.create({ user, badge, unlockedAt: new Date() });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Error al desbloquear badge' });
  }
};
