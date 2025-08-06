import express from 'express';
import {
  registerUser,
  loginUser,
  getAllUsers,
  deleteUser,
  getMyProfile,
  updateMyProfile,
  requestPasswordReset,
  resetPassword,
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getAllUsers);
router.delete('/:id', deleteUser);

// User profile routes
router.get('/me', verifyToken, getMyProfile);
router.put('/me', verifyToken, updateMyProfile);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
