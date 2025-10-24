import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  refreshToken
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerValidation, loginValidation } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);

export default router;
