import db from '../db/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ✅ REGISTER
export const registerUser = async (req, res) => {
  try {
    let { name, username, email, password, role } = req.body;
    name = name || username;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [userExists] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'buyer']
    );

    // ✅ Fetch new user data
    const [newUserData] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
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
        email: newUser.email,
        role: newUser.role,
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
    const [userData] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
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
    const [users] = await db.query('SELECT id, name, email, role FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE USER
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
