import express from 'express';
import { saveAddress, getUserAddresses } from '../controllers/addressController.js';
import { verifyToken, allowRoles } from '../middleware/auth.js';

const router = express.Router();

// Save new address
router.post('/', verifyToken, allowRoles('buyer'), saveAddress);

// Get user addresses
router.get('/:userId', verifyToken, allowRoles('buyer'), getUserAddresses);

export default router; 