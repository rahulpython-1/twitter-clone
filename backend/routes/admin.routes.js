import express from 'express';
import {
  getPlatformStats,
  getAllUsers,
  verifyUser,
  suspendUser,
  deleteTweetAdmin,
  getReports
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin role
router.use(protect, authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/suspend', suspendUser);
router.delete('/tweets/:id', deleteTweetAdmin);
router.get('/reports', getReports);

export default router;
