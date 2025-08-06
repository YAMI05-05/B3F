import db from '../db/database.js';
import { QueryTypes } from 'sequelize';

// POST /api/addresses - Save new address
export const saveAddress = async (req, res) => {
  try {
    const { firstName, lastName, email, street, city, state, zipcode, country, phone } = req.body;
    const user_id = req.user.id; // From auth middleware

    if (!firstName || !lastName || !street || !city || !state || !country) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const result = await db.query(
      'INSERT INTO addresses (user_id, firstName, lastName, email, street, city, state, zipcode, country, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [user_id, firstName, lastName, email, street, city, state, zipcode, country, phone],
        type: db.QueryTypes.INSERT
      }
    );

    res.json({
      success: true,
      message: 'Address saved successfully',
      address_id: result[0] && result[0].insertId
    });
  } catch (err) {
    console.error('Save Address Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// GET /api/addresses/:userId - Get all addresses for a user
export const getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const addresses = await db.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC',
      {
        replacements: [userId],
        type: db.QueryTypes.SELECT
      }
    );

    res.json(addresses);
  } catch (err) {
    console.error('Get Addresses Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
}; 