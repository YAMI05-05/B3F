import express from 'express';
import {
  getCartByUser,
  addToCart,
  removeCartItem
} from '../controllers/cartController.js';

import { verifyToken, allowRoles } from '../middleware/auth.js'; 

const router = express.Router();

router.get('/:userId', verifyToken, allowRoles('buyer'), getCartByUser);
router.post('/add', verifyToken, allowRoles('buyer'), addToCart);
router.delete('/:id', verifyToken, allowRoles('buyer'), removeCartItem);

export default router;
