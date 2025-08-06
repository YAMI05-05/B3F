import db from '../db/database.js';
import { QueryTypes } from 'sequelize';

export const getAdminStats = async (req, res) => {
  try {
    console.log('Fetching admin stats...');
    // Total users and user list
    const users = await db.query('SELECT id, name, email, role FROM users', { type: QueryTypes.SELECT });
    console.log('Users:', users);
    // Total products and product list
    const products = await db.query('SELECT * FROM products', { type: QueryTypes.SELECT });
    console.log('Products:', products);
    // Total orders and today's orders
    const orders = await db.query('SELECT * FROM orders', { type: QueryTypes.SELECT });
    console.log('Orders:', orders);
    const ordersToday = await db.query("SELECT * FROM orders WHERE DATE(created_at) = CURDATE()", { type: QueryTypes.SELECT });
    console.log('Orders Today:', ordersToday);

    res.json({
      totalUsers: users.length,
      users,
      totalProducts: products.length,
      products,
      totalOrders: orders.length,
      ordersToday: ordersToday.length,
      ordersTodayList: ordersToday
    });
  } catch (err) {
    console.error('Error in getAdminStats:', err);
    res.status(500).json({ error: err.message });
  }
}; 