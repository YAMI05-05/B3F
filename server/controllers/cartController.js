import db from '../db/database.js';

// GET /api/cart/:userId
export const getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const [cart] = await db.query(
      `SELECT cart.id, cart.quantity, products.name, products.price 
       FROM cart 
       JOIN products ON cart.product_id = products.id 
       WHERE cart.user_id = ?`,
      [userId]
    );
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/cart/add
export const addToCart = async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  try {
    await db.query(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [user_id, product_id, quantity || 1]
    );
    res.json({ message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/cart/:id
export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM cart WHERE id = ?', [id]);
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
