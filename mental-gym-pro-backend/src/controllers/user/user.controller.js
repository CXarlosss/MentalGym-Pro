// src/controllers/user/user.controller.js
import bcrypt from 'bcrypt';
import User from '../../models/user/User.js';
import Routine from '../../models/fitness/Routine.js';

/**
 * @typedef {Object} TPublicUser
 * @property {Object} _id  // Change from string to ObjectId
 * @property {string} username
 * @property {string=} avatar
 * @property {Array<Object>=} followers  // Change from string to ObjectId
 * @property {Array<Object>=} following  // Change from string to ObjectId
 */

/**
 * @typedef {Object} TUserProfile
 * @property {Object} _id  // Change from string to ObjectId
 * @property {string} username
 * @property {string} email
 * @property {string=} avatar
 * @property {Date=} createdAt
 * @property {Date=} updatedAt
 */

// GET /api/users/me
export const getMe = async (req, res) => {
  try {
    const raw = await User.findById(req.user._id)
      .select('-password -__v')
      .lean()
      .exec();

    /** @type {TPublicUser | null} */
    const user = raw && !Array.isArray(raw) ? /** @type {TPublicUser} */ (raw) : null;

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error('[user.getMe] Error:', err);
    return res.status(500).json({
      message: 'Error fetching user profile',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// PATCH /api/users/me
export const updateMe = async (req, res) => {
  try {
    const { username, email, avatar } = req.body || {};
    const userId = req.user._id;

    if (!username && !email && avatar === undefined) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) return res.status(409).json({ message: 'Email already in use' });
    }

    if (username) {
      const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUsername) return res.status(409).json({ message: 'Username already in use' });
    }

    /** @type {Record<string, any>} */
    const update = {};
    if (username) update.username = username;
    if (email) update.email = email;
    if (avatar !== undefined) update.avatar = avatar;

    const raw = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-password -__v')
     .lean()
     .exec();

    /** @type {TUserProfile | null} */
    const updatedUser = raw && !Array.isArray(raw) ? /** @type {TUserProfile} */ (raw) : null;

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    return res.json(updatedUser);
  } catch (err) {
    console.error('[user.updateMe] Error:', err);
    return res.status(500).json({
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// POST /api/users/me/password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('[user.changePassword] Error:', err);
    return res.status(500).json({
      message: 'Error changing password',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// GET /api/users/:id (public profile)
export const getPublicProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const raw = await User.findById(userId)
      .select('username avatar followers following')
      .lean()
      .exec();

    /** @type {TPublicUser | null} */
    const user = raw && !Array.isArray(raw) ? /** @type {TPublicUser} */ (raw) : null;

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error('[user.getPublicProfile] Error:', err);
    return res.status(500).json({
      message: 'Error fetching public profile',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// POST /api/users/:id/follow
export const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.user._id;

    if (targetId === String(userId)) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetId)
    ]);

    if (!currentUser) return res.status(404).json({ message: 'Current user not found' });
    if (!targetUser) return res.status(404).json({ message: 'User to follow not found' });

    if (!currentUser.following.map(String).includes(String(targetId))) {
      currentUser.following.push(targetId);
    }
    if (!targetUser.followers.map(String).includes(String(userId))) {
      targetUser.followers.push(userId);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);
    return res.json({ success: true });
  } catch (err) {
    console.error('[user.followUser] Error:', err);
    return res.status(500).json({
      message: 'Error following user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// DELETE /api/users/:id/follow
export const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.user._id;

    const [currentUser, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetId)
    ]);

    if (!currentUser) return res.status(404).json({ message: 'Current user not found' });
    if (!targetUser) return res.status(404).json({ message: 'User to unfollow not found' });

    currentUser.following = currentUser.following.filter(id => String(id) !== String(targetId));
    targetUser.followers = targetUser.followers.filter(id => String(id) !== String(userId));

    await Promise.all([currentUser.save(), targetUser.save()]);
    return res.json({ success: true });
  } catch (err) {
    console.error('[user.unfollowUser] Error:', err);
    return res.status(500).json({
      message: 'Error unfollowing user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// GET /api/users/me/followers
export const myFollowers = async (req, res) => {
  try {
    const raw = await User.findById(req.user._id)
      .populate('followers', 'username avatar')
      .lean()
      .exec();

    const followers = raw && !Array.isArray(raw) ? (raw.followers || []) : [];
    return res.json(followers);
  } catch (err) {
    console.error('[user.myFollowers] Error:', err);
    return res.status(500).json({
      message: 'Error fetching followers',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// GET /api/users/me/following
export const myFollowing = async (req, res) => {
  try {
    const raw = await User.findById(req.user._id)
      .populate('following', 'username avatar')
      .lean()
      .exec();

    const following = raw && !Array.isArray(raw) ? (raw.following || []) : [];
    return res.json(following);
  } catch (err) {
    console.error('[user.myFollowing] Error:', err);
    return res.status(500).json({
      message: 'Error fetching following list',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// POST /api/users/me/routines/:routineId/save
export const saveRoutine = async (req, res) => {
  try {
    const { routineId } = req.params;
    const userId = req.user._id;

    const [routine, user] = await Promise.all([
      Routine.findById(routineId),
      User.findById(userId)
    ]);

    if (!routine) return res.status(404).json({ message: 'Routine not found' });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.savedRoutines.map(String).includes(String(routineId))) {
      user.savedRoutines.push(routineId);
      await user.save();
    }

    return res.json({ success: true, savedRoutines: user.savedRoutines });
  } catch (err) {
    console.error('[user.saveRoutine] Error:', err);
    return res.status(500).json({
      message: 'Error saving routine',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// DELETE /api/users/me/routines/:routineId/save
export const unsaveRoutine = async (req, res) => {
  try {
    const { routineId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.savedRoutines = user.savedRoutines.filter(id => String(id) !== String(routineId));
    await user.save();

    return res.json({ success: true, savedRoutines: user.savedRoutines });
  } catch (err) {
    console.error('[user.unsaveRoutine] Error:', err);
    return res.status(500).json({
      message: 'Error unsaving routine',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
