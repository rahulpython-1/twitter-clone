import express from 'express';
import {
  addBookmark,
  getBookmarks,
  deleteBookmark,
  getFolders
} from '../controllers/bookmark.controller.js';
import { protect } from '../middleware/auth.js';
import { idValidation } from '../middleware/validation.js';

const router = express.Router();

router.post('/', protect, addBookmark);
router.get('/', protect, getBookmarks);
router.delete('/:id', protect, idValidation, deleteBookmark);
router.get('/folders', protect, getFolders);

export default router;
