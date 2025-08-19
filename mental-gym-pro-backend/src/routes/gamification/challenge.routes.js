import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  getActiveChallenges,
  listChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  joinChallenge,
  updateMyChallengeProgress,
  listMyChallenges,
} from '../../controllers/gamification/challenge.controller.js';

const r = Router();

// públicas
r.get('/active', getActiveChallenges);     // compat con frontend
r.get('/', listChallenges);
r.get('/:id', getChallengeById);

// user
r.get('/me/list', protect, listMyChallenges);
r.post('/:id/join', protect, joinChallenge);
r.patch('/:id/progress', protect, updateMyChallengeProgress);

// admin/protegidas (ajusta protect/roles si necesitas)
r.post('/', protect, createChallenge);
r.patch('/:id', protect, updateChallenge);
r.delete('/:id', protect, deleteChallenge);

export default r;
