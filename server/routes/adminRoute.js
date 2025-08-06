import express from 'express';
import { getAllUsers, deleteUser } from '../controllers/userController.js';
import { getAdminStats } from '../controllers/adminController.js';
const router = express.Router();
import { verifyToken, allowRoles } from '../middleware/auth.js';
import { sendMail } from '../utils/emailservice.js';

// Dashboard stats
router.get('/stats', verifyToken, allowRoles('admin'), getAdminStats);

// List all users (real data)
router.get('/users', verifyToken, allowRoles('admin'), getAllUsers);



// Delete a user
router.delete('/users/:id', verifyToken, allowRoles('admin'), deleteUser);

router.get('/test-email', async (req, res) => {
  try {
    await sendMail({
      to: 'recipient@example.com',
      subject: 'Test Email',
      text: 'Hello from Nodemailer!',
    });
    res.json({ success: true, message: 'Email sent!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
