import express from 'express';
import {
  checkoutOrder,
  getUserOrders,
  getAllOrders,
  getSellerOrders,
  confirmOrder,
} from '../controllers/orderController.js';

const router = express.Router();
import { verifyToken, allowRoles } from '../middleware/auth.js';

router.post('/checkout', verifyToken, allowRoles('buyer'), checkoutOrder);
router.get('/user/:userId', verifyToken, allowRoles('buyer'), getUserOrders);
router.get('/', verifyToken, allowRoles('admin'), getAllOrders); // only admin
router.get('/seller', verifyToken, allowRoles('seller'), getSellerOrders);
router.put('/confirm/:orderId', verifyToken, allowRoles('admin', 'seller'), confirmOrder);

export default router;
