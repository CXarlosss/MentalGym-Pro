import { Router } from 'express';
import { getMySessions, createSession } from '../../controllers/cognitive/session.controller.js';
import { protect } from '../../middleware/auth.js';

const router = Router();

router.get('/', protect, getMySessions);
router.post('/', protect, createSession);

export default router;
