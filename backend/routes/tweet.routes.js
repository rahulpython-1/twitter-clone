import express from 'express';
import {
  createTweet,
  getFeed,
  getTweet,
  deleteTweet,
  likeTweet,
  unlikeTweet,
  retweet,
  undoRetweet,
  getReplies,
  votePoll
} from '../controllers/tweet.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { tweetValidation, idValidation } from '../middleware/validation.js';
import { tweetLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', protect, tweetLimiter, tweetValidation, createTweet);
router.get('/feed', protect, getFeed);
router.get('/:id', optionalAuth, idValidation, getTweet);
router.delete('/:id', protect, idValidation, deleteTweet);
router.post('/:id/like', protect, idValidation, likeTweet);
router.delete('/:id/like', protect, idValidation, unlikeTweet);
router.post('/:id/retweet', protect, idValidation, retweet);
router.delete('/:id/retweet', protect, idValidation, undoRetweet);
router.get('/:id/replies', idValidation, getReplies);
router.post('/:id/poll/vote', protect, idValidation, votePoll);

export default router;
