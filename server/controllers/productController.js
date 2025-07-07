import db from '../db/database.js';

// GET all products
export const getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST new product (requires authentication and role)
export const createProduct = async (req, res) => {
  const { name, description, price, category, offerPrice } = req.body;
  const seller_id = req.user?.id;

  if (!name || !price || !seller_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

    await db.query(
      `INSERT INTO products (name, description, category, price, offerPrice, seller_id, images)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        category,
        price,
        offerPrice || null,
        seller_id,
        JSON.stringify(imagePaths)
      ]
    );

    res.json({ success: true, message: 'Product created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  const { name, description, price, category, offerPrice } = req.body;
  const { id } = req.params;
  const seller_id = req.user?.id;

  try {
    const fields = [];
    const values = [];

    if (name) fields.push('name = ?'), values.push(name);
    if (description) fields.push('description = ?'), values.push(description);
    if (price) fields.push('price = ?'), values.push(price);
    if (category) fields.push('category = ?'), values.push(category);
    if (offerPrice) fields.push('offerPrice = ?'), values.push(offerPrice);
    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);
      fields.push('images = ?');
      values.push(JSON.stringify(imagePaths));
    }

    fields.push('seller_id = ?');
    values.push(seller_id);

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    values.push(id);
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(sql, values);

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
