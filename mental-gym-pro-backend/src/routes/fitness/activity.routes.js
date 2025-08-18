import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { getWeeklyActivity, upsertTodayActivity, listActivity } from '../../controllers/fitness/activity.controller.js';

const router = Router();

router.get('/week', protect, getWeeklyActivity);
router.put('/today', protect, upsertTodayActivity);
router.get('/', protect, listActivity);

export default router;
