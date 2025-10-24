import express from 'express';
import {
  getUserProfile,
  updateProfile,
  uploadAvatar,
  uploadBanner,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserTweets,
  updateSettings,
  blockUser,
  unblockUser
} from '../controllers/user.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { updateProfileValidation, idValidation } from '../middleware/validation.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/:username', optionalAuth, getUserProfile);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.post('/avatar', protect, uploadLimiter, uploadAvatar);
router.post('/banner', protect, uploadLimiter, uploadBanner);
router.post('/:id/follow', protect, idValidation, followUser);
router.delete('/:id/follow', protect, idValidation, unfollowUser);
router.get('/:id/followers', idValidation, getFollowers);
router.get('/:id/following', idValidation, getFollowing);
router.get('/:username/tweets', getUserTweets);
router.put('/settings', protect, updateSettings);
router.post('/:id/block', protect, idValidation, blockUser);
router.delete('/:id/block', protect, idValidation, unblockUser);

export default router;
