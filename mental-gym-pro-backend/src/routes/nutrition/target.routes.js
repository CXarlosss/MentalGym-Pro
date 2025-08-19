import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { getMyTargets, upsertMyTargets } from '../../controllers/nutrition/target.controller.js';

const r = Router();
r.use(protect);

r.get('/me', getMyTargets);
r.put('/me', upsertMyTargets);

export default r;
