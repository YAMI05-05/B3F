import express from 'express';
import {
  registerUser,
  loginUser,
  getAllUsers,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getAllUsers);
router.delete('/:id', deleteUser);

export default router;
