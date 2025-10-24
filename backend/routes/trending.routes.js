import express from 'express';
import {
  getTrendingTopics,
  getTrendingTweets,
  getSuggestedUsers,
  getExploreFeed
} from '../controllers/trending.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/topics', getTrendingTopics);
router.get('/tweets', getTrendingTweets);
router.get('/users', optionalAuth, getSuggestedUsers);
router.get('/explore', optionalAuth, getExploreFeed);

export default router;
