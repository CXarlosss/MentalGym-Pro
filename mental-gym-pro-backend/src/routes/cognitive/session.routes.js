import { Router } from 'express';
import { getMySessions, createSession, completeSession } from '../../controllers/cognitive/session.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();

router.get('/', protect, getMySessions);
router.post('/', protect, createSession);
router.post('/:sessionId/complete', protect, completeSession); // 👈 FALTABA

export default router;
