import express from 'express';
import { verifyToken, allowRoles } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct
} from '../controllers/productController.js';

const router = express.Router();

// GET all products
router.get('/', getAllProducts);

// Create new product
router.post(
  '/',
  verifyToken,
  allowRoles('seller', 'admin'),
  upload.array('images', 4), // ✅ Corrected field name
  createProduct
);

// Update product
router.put(
  '/:id',
  verifyToken,
  allowRoles('seller', 'admin'),
  upload.array('images', 4), // ✅ Corrected field name
  updateProduct
);

// Delete product
router.delete('/:id', verifyToken, allowRoles('seller', 'admin'), deleteProduct);

export default router;
