import express from 'express';
import {
  createList,
  getUserLists,
  getList,
  updateList,
  deleteList,
  addMember,
  removeMember,
  getListTweets
} from '../controllers/list.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { idValidation } from '../middleware/validation.js';

const router = express.Router();

router.post('/', protect, createList);
router.get('/', protect, getUserLists);
router.get('/:id', optionalAuth, idValidation, getList);
router.put('/:id', protect, idValidation, updateList);
router.delete('/:id', protect, idValidation, deleteList);
router.post('/:id/members/:userId', protect, addMember);
router.delete('/:id/members/:userId', protect, removeMember);
router.get('/:id/tweets', optionalAuth, idValidation, getListTweets);

export default router;
