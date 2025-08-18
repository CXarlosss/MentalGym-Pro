import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { addCardioToday, listCardio, getCardioWeek } from '../../controllers/fitness/cardio.controller.js';

const router = Router();

router.post('/', protect, addCardioToday);
router.get('/', protect, listCardio);
router.get('/week', protect, getCardioWeek);

export default router;
