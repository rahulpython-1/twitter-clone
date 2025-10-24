import express from 'express';
import {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
  deleteConversation
} from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.js';
import { idValidation } from '../middleware/validation.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/conversations/:id', protect, idValidation, getConversation);
router.post('/conversations', protect, createConversation);
router.delete('/conversations/:id', protect, idValidation, deleteConversation);
router.post('/conversations/:id/messages', protect, idValidation, sendMessage);
router.get('/conversations/:id/messages', protect, idValidation, getMessages);
router.put('/messages/:id/read', protect, idValidation, markAsRead);
router.delete('/messages/:id', protect, idValidation, deleteMessage);

export default router;
