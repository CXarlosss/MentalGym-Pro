import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  listBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  listMyBadges,
  unlockBadgeForMe,
} from '../../controllers/gamification/badge.controller.js';

const r = Router();

// catálogo
r.get('/', listBadges);
r.post('/', protect, createBadge);     // pon middleware de admin si lo tienes
r.patch('/:id', protect, updateBadge);
r.delete('/:id', protect, deleteBadge);

// user badges
r.get('/me', protect, listMyBadges);
r.post('/me/:badgeId/unlock', protect, unlockBadgeForMe);

export default r;
