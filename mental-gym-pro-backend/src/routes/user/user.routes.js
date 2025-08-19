import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import {
  getMe, updateMe, changePassword,
  getPublicProfile,
  followUser, unfollowUser,
  myFollowers, myFollowing,
  saveRoutine, unsaveRoutine
} from '../../controllers/user/user.controller.js';

const r = Router();

r.get('/me', protect, getMe);
r.patch('/me', protect, updateMe);
r.post('/me/password', protect, changePassword);

r.get('/:id', getPublicProfile);

r.post('/:id/follow', protect, followUser);
r.delete('/:id/follow', protect, unfollowUser);

r.get('/me/followers', protect, myFollowers);
r.get('/me/following', protect, myFollowing);

r.post('/me/routines/:routineId/save', protect, saveRoutine);
r.delete('/me/routines/:routineId/save', protect, unsaveRoutine);

export default r;
