import express from 'express';
import {
  searchAll,
  searchUsers,
  searchTweets,
  getTweetsByHashtag
} from '../controllers/search.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, searchAll);
router.get('/users', searchUsers);
router.get('/tweets', searchTweets);
router.get('/hashtag/:tag', getTweetsByHashtag);

export default router;
