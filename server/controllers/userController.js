import db from '../db/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { QueryTypes } from 'sequelize';
import crypto from 'crypto';
import { sendPasswordReset } from '../utils/emailservice.js';

// ✅ REGISTER
export const registerUser = async (req, res) => {
  try {
    let { name, username, email, password, role } = req.body;
    name = name || username;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Fix: Use Sequelize SELECT query correctly
    const userExists = await db.query(
      'SELECT * FROM users WHERE email = ?',
      {
        replacements: [email],
        type: db.QueryTypes.SELECT
      }
    );
    if (userExists.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
      {
        replacements: [name, username, email, hashedPassword, role || 'buyer'],
        type: db.QueryTypes.INSERT
      }
    );

    // ✅ Fetch new user data
    const newUserData = await db.query(
      'SELECT * FROM users WHERE email = ?',
      {
        replacements: [email],
        type: db.QueryTypes.SELECT
      }
    );
    const newUser = newUserData[0];

    // ✅ Create JWT token
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username, // <-- add this line
        email: newUser.email,
        role: newUser.role,
        image: newUser.image || null, // <-- add if you want to test for image
        isAdmin: newUser.role === 'admin', // <-- add if you want to test for isAdmin
      },
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};



// ✅ LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fix: Use Sequelize SELECT query correctly
    const userData = await db.query(
      'SELECT * FROM users WHERE email = ?',
      {
        replacements: [email],
        type: db.QueryTypes.SELECT
      }
    );
    if (userData.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userData[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// ✅ GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    // Fix: Use Sequelize SELECT query correctly
    const users = await db.query(
      'SELECT id, name, username, email, role FROM users',
      { type: db.QueryTypes.SELECT }
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE USER
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    // Start a transaction to ensure data consistency
    await db.query('START TRANSACTION');
    
    // Delete related data in the correct order to avoid foreign key constraint violations
    
    // 1. Delete cart items for this user
    await db.query(
      'DELETE FROM cart WHERE user_id = ?',
      {
        replacements: [id],
        type: db.QueryTypes.RAW
      }
    );
    
    // 2. Delete order items for orders made by this user
    await db.query(`
      DELETE oi FROM order_items oi 
      INNER JOIN orders o ON oi.order_id = o.id 
      WHERE o.user_id = ?
    `, { replacements: [id], type: db.QueryTypes.RAW });
    
    // 3. Delete orders made by this user
    await db.query(
      'DELETE FROM orders WHERE user_id = ?',
      {
        replacements: [id],
        type: db.QueryTypes.RAW
      }
    );
    
    // 4. Delete addresses for this user
    await db.query(
      'DELETE FROM addresses WHERE user_id = ?',
      {
        replacements: [id],
        type: db.QueryTypes.RAW
      }
    );
    
    // 5. Delete products sold by this user (if they are a seller)
    await db.query(
      'DELETE FROM products WHERE seller_id = ?',
      {
        replacements: [id],
        type: db.QueryTypes.RAW
      }
    );
    
    // Finally, delete the user
    const result = await db.query(
      'DELETE FROM users WHERE id = ?',
      {
        replacements: [id],
        type: db.QueryTypes.RAW
      }
    );
    
    if (result[0].affectedRows === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found' });
    }
    
    await db.query('COMMIT');
    res.json({ message: 'User and all related data deleted successfully' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Delete user error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get current user's profile
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
   
    const rows = await db.query(
      'SELECT id, name, username, email, role FROM users WHERE id = ?',
      {
        replacements: [userId],
        type: db.QueryTypes.SELECT
      }
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update current user's profile
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, username, email, password } = req.body;
    let updateFields = [];
    let values = [];
    if (name) { updateFields.push('name = ?'); values.push(name); }
    if (username) { updateFields.push('username = ?'); values.push(username); }
    if (email) { updateFields.push('email = ?'); values.push(email); }
    if (password) {
      const bcrypt = (await import('bcrypt')).default;
      const hashed = await bcrypt.hash(password, 10);
      updateFields.push('password = ?'); values.push(hashed);
    }
    if (updateFields.length === 0) return res.status(400).json({ message: 'No fields to update' });
    values.push(userId);
    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      {
        replacements: [...values, userId],
        type: db.QueryTypes.UPDATE
      }
    );
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = Date.now() + 3600000; // 1 hour

  // Save token and expiry to user
  await db.query('UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?', {
    replacements: [token, expiry, email],
    type: db.QueryTypes.UPDATE
  });

  const resetLink = `http://localhost:5173/reset-password?token=${token}&email=${email}`;
  await sendPasswordReset(email, resetLink);

  res.json({ success: true, message: 'Password reset email sent' });
};

// Reset password
export const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  let users;
  if (token) {
    // Token-based reset (from email link)
    users = await db.query('SELECT * FROM users WHERE email = ? AND resetToken = ? AND resetTokenExpiry > ?', {
      replacements: [email, token, Date.now()],
      type: db.QueryTypes.SELECT
    });
    if (!users.length) return res.status(400).json({ message: 'Invalid or expired token' });
  } else {
    // Direct reset (no token, from forgot password page)
    users = await db.query('SELECT * FROM users WHERE email = ?', {
      replacements: [email],
      type: db.QueryTypes.SELECT
    });
    if (!users.length) return res.status(400).json({ message: 'User not found' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE email = ?', {
    replacements: [hashed, email],
    type: db.QueryTypes.UPDATE
  });

  res.json({ success: true, message: 'Password has been reset' });
};
