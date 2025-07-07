import express from 'express';
const router = express.Router();

// TEMP: List all users (dummy data for now)
router.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'Admin User', role: 'admin' },
    { id: 2, name: 'Regular User', role: 'buyer' }
  ]);
});

export default router;
