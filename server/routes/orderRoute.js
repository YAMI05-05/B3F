import express from 'express';
import {
  checkoutOrder,
  getUserOrders,
  getAllOrders
} from '../controllers/orderController.js';

const router = express.Router();
import { verifyToken, allowRoles } from '../middleware/auth.js';


router.post('/checkout', verifyToken, allowRoles('buyer'), checkoutOrder);
router.get('/user/:userId', verifyToken, allowRoles('buyer'), getUserOrders);
router.get('/', verifyToken, allowRoles('admin'), getAllOrders); // only admin


export default router;
