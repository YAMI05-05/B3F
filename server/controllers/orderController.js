import db from '../db/database.js';

// POST /api/orders/checkout
export const checkoutOrder = async (req, res) => {
  const { user_id } = req.body;

  try {
    // Create new order
    const [result] = await db.query(
      'INSERT INTO orders (user_id) VALUES (?)',
      [user_id]
    );

    const order_id = result.insertId;

    // Get all items in cart
    const [cartItems] = await db.query(
      'SELECT product_id, quantity FROM cart WHERE user_id = ?',
      [user_id]
    );

    // Insert order items
    for (let item of cartItems) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
        [order_id, item.product_id, item.quantity]
      );
    }

    // Clear cart
    await db.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

    res.json({ message: 'Order placed successfully', order_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders/user/:userId
export const getUserOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders/ (admin)
export const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT o.id, u.name, o.status, o.created_at FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC'
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
