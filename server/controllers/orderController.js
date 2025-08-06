import db from '../db/database.js';
import { QueryTypes } from 'sequelize';
import { sendOrderConfirmation } from '../utils/emailservice.js';
import { sendOrderReceived } from '../utils/emailservice.js';

// POST /api/orders/checkout
export const checkoutOrder = async (req, res) => {
  const { items, address, paymentOption, total } = req.body;
  const user_id = req.user.id; // From auth middleware

  // Debug log to help diagnose undefined user_id
  console.log('checkoutOrder: req.user =', req.user, 'user_id =', user_id);

  try {
    // First save the address if it doesn't have an id
    let address_id = address.id;
    if (!address_id) {
      const addressResult = await db.query(
        `INSERT INTO addresses (user_id, firstName, lastName, email, street, city, state, zipcode, country, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [user_id, address.firstName, address.lastName, address.email, address.street, address.city, address.state, address.zipcode, address.country, address.phone],
          type: db.QueryTypes.INSERT
        }
      );
      address_id = addressResult[0] && addressResult[0].insertId;
    }

    // Create new order with address_id
    const result = await db.query(
      `INSERT INTO orders (user_id, address_id, status) VALUES (?, ?, ?)`,
      {
        replacements: [user_id, address_id, 'pending'],
        type: db.QueryTypes.INSERT
      }
    );

    const order_id = result[0]; 
    if (!order_id) {
      console.error('Order creation failed: order_id is undefined. result:', result);
      return res.status(500).json({ error: 'Order creation failed. Please try again.' });
    }

    // Insert order items from the request
    for (let item of items) {
      console.log('order_id:', order_id, 'item:', item);
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)`,
        {
          // Use item.id if that's what your frontend sends
          replacements: [order_id, item.id, item.quantity],
          type: db.QueryTypes.INSERT
        }
      );
    }

    // Clear cart for this user
    await db.query('DELETE FROM cart WHERE user_id = ?', {
      replacements: [user_id],
      type: db.QueryTypes.DELETE
    });

    // Fetch user email for confirmation
    const userRows = await db.query('SELECT email FROM users WHERE id = ?', {
      replacements: [user_id],
      type: db.QueryTypes.SELECT
    });
    const userEmail = userRows[0]?.email || address.email;
    // Send order confirmation email
    try {
      // Fetch order items for the email
      const orderItems = await db.query(
        `SELECT p.name, oi.quantity, 
                CASE WHEN p.offerPrice IS NOT NULL AND p.offerPrice < p.price THEN p.offerPrice ELSE p.price END AS price
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        {
          replacements: [order_id],
          type: db.QueryTypes.SELECT
        }
      );

      // Send order confirmation email
      await sendOrderConfirmation(userEmail, {
        id: order_id,
        total,
        name: address.firstName || 'Customer',
        date: new Date().toLocaleDateString(),
        items: orderItems
      });
    } catch (emailErr) {
      console.error('Order confirmation email failed:', emailErr);
    }

    res.json({ 
      success: true,
      message: 'Order placed successfully',
      order_id,
      total 
    });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders/user/:userId
export const getUserOrders = async (req, res) => {
  const { userId } = req.params;
  console.log('=== START: Fetching orders for user:', userId, '===');
  
  try {
    // First, let's check if the user exists
    const userCheck = await db.query('SELECT id, name, email FROM users WHERE id = ?', {
      replacements: [userId],
      type: db.QueryTypes.SELECT
    });
    if (userCheck.length === 0) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('✅ User found:', userCheck[0]);
    // Get orders with address details
    const orders = await db.query(
      `SELECT o.id, o.status, o.created_at, o.address_id,
              a.firstName, a.lastName, a.street, a.city, a.state, a.zipcode, a.country, a.phone
       FROM orders o 
       LEFT JOIN addresses a ON o.address_id = a.id 
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      {
        replacements: [userId],
        type: db.QueryTypes.SELECT
      }
    );
    
    console.log('✅ Raw orders query result:', orders);
    
    console.log('✅ Found', orders.length, 'orders for user', userId);
    
    if (orders.length === 0) {
      console.log('✅ No orders found, returning empty array');
      return res.json([]);
    }
    
    // For each order, get the order items with product details
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        console.log('🔍 Processing order:', order.id);
        
        const orderItems = await db.query(
          `SELECT oi.id, oi.quantity, oi.product_id,
                  p.name, p.description, p.price, p.images, p.category, p.offerPrice
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          {
            replacements: [order.id],
            type: db.QueryTypes.SELECT
          }
        );
        
        console.log('✅ Order items for order', order.id, ':', orderItems);
        
        // Calculate total for this order
        const total = orderItems.reduce((sum, item) => {
          const price = parseFloat(item.offerPrice || item.price);
          return sum + (price * item.quantity);
        }, 0);
        
        return {
          id: order.id,
          status: order.status,
          createdAt: order.created_at,
          total: total,
          address: {
            firstName: order.firstName,
            lastName: order.lastName,
            street: order.street,
            city: order.city,
            state: order.state,
            zipcode: order.zipcode,
            country: order.country,
            phone: order.phone
          },
          items: orderItems.map(item => {
            // Parse images JSON or fallback to empty array
            let images = [];
            if (item.images) {
              try {
                images = JSON.parse(item.images);
              } catch (e) {
                images = [];
              }
            }
            
            return {
              id: item.id,
              productId: item.product_id,
              quantity: item.quantity,
              product: {
                name: item.name,
                description: item.description,
                price: parseFloat(item.price),
                offerPrice: parseFloat(item.offerPrice || item.price),
                image: images,
                category: item.category
              }
            };
          })
        };
      })
    );
    
    console.log('✅ Successfully processed orders with items');
    console.log('=== END: Returning', ordersWithItems.length, 'orders ===');
    res.json(ordersWithItems);
    
  } catch (err) {
    console.error('❌ ERROR in getUserOrders:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState
    });
    res.status(500).json({ 
      error: err.message,
      details: {
        code: err.code,
        sqlMessage: err.sqlMessage,
        sqlState: err.sqlState
      }
    });
  }
};

// GET /api/orders/ (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await db.query(
      `SELECT o.id, u.name, o.status, o.created_at, a.firstName, a.lastName, a.street, a.city, a.state, a.country
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       LEFT JOIN addresses a ON o.address_id = a.id 
       ORDER BY o.created_at DESC`,
      { type: db.QueryTypes.SELECT }
    );
    res.json(orders);
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ error: err.message });
  }
}; 

export const confirmOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      {
        replacements: ['confirmed', orderId],
        type: db.QueryTypes.UPDATE
      }
    );

    // Fetch order, user, and items for the email
    const orderRow = await db.query(
      `SELECT o.id, o.user_id, o.address_id, o.status, o.created_at, a.firstName, u.email
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      {
        replacements: [orderId],
        type: db.QueryTypes.SELECT
      }
    );
    const order = orderRow[0];

    const orderItems = await db.query(
      `SELECT p.name, oi.quantity, 
              CASE WHEN p.offerPrice IS NOT NULL AND p.offerPrice < p.price THEN p.offerPrice ELSE p.price END AS price
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      {
        replacements: [orderId],
        type: db.QueryTypes.SELECT
      }
    );

    // Calculate total
    const total = orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    // Send order received email
    try {
      await sendOrderReceived(order.email, {
        id: order.id,
        total,
        name: order.firstName || 'Customer',
        date: new Date(order.created_at).toLocaleDateString(),
        items: orderItems
      });
    } catch (emailErr) {
      console.error('Order received email failed:', emailErr);
    }

    res.json({ success: true, message: 'Order confirmed!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

export const getSellerOrders = async (req, res) => {
  const sellerId = req.user.id; // From auth middleware
  try {
    // Get all orders that include products sold by this seller, with address info
    const orders = await db.query(
      `SELECT o.id, o.status, o.created_at, o.address_id,
              a.firstName, a.lastName, a.street, a.city, a.state, a.zipcode, a.country, a.phone,
              oi.product_id, oi.quantity, p.name AS product_name, p.category, p.price, p.offerPrice, p.images
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE p.seller_id = ?
       ORDER BY o.created_at DESC`,
      {
        replacements: [sellerId],
        type: db.QueryTypes.SELECT
      }
    );

    // Group by order id
    const grouped = {};
    for (const row of orders) {
      if (!grouped[row.id]) {
        grouped[row.id] = {
          id: row.id,
          status: row.status,
          createdAt: row.created_at,
          address_id: row.address_id,
          firstName: row.firstName,
          lastName: row.lastName,
          street: row.street,
          city: row.city,
          phone: row.phone,
          items: []
        };
      }
      let images = [];
      try {
        images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images;
      } catch { images = []; }
      grouped[row.id].items.push({
        product_id: row.product_id,
        quantity: row.quantity,
        name: row.product_name,
        category: row.category,
        price: row.price,
        offerPrice: row.offerPrice,
        images
      });
    }

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 