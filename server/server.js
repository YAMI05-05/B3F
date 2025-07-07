import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoute.js';
import productRoutes from './routes/productRoute.js';
import cartRoutes from './routes/cartRoute.js';
import orderRoutes from './routes/orderRoute.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // frontend
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', userRoutes); // ✅ use /api/auth 
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('B3F Backend is running...');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
