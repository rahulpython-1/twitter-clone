import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.js';
import { idValidation } from '../middleware/validation.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, idValidation, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, idValidation, deleteNotification);

export default router;
