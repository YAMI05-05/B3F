import db from '../db/database.js';

// ✅ GET all products with normalization for frontend
export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");

    const mapped = rows.map((p) => ({
      ...p,
      _id: p.id?.toString(),
      image: (() => {
        if (p.images) {
          try {
            return JSON.parse(p.images);
          } catch {
            return [];
          }
        }
        return p.image ? [p.image] : [];
      })(),
      description: Array.isArray(p.description)
        ? p.description
        : [p.description || ""],
      offerPrice: parseFloat(p.offerPrice || p.price),
      inStock: typeof p.inStock !== "undefined" ? !!p.inStock : true,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ POST new product (requires authentication and role)
export const createProduct = async (req, res) => {
  const { name, description, price, category, offerPrice, inStock = true } = req.body;
  const seller_id = req.user?.id;

  if (!name || !price || !seller_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

    await db.query(
      `INSERT INTO products (name, description, category, price, offerPrice, seller_id, images, inStock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        category,
        price,
        offerPrice || null,
        seller_id,
        JSON.stringify(imagePaths),
        inStock,
      ]
    );

    res.json({ success: true, message: 'Product created successfully' });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE product (dynamic fields)
export const updateProduct = async (req, res) => {
  const { name, description, price, category, offerPrice, inStock } = req.body;
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
    if (typeof inStock !== "undefined") fields.push('inStock = ?'), values.push(inStock);

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
    console.error("Error updating product:", err);
    res.status(500).json({ error: err.message });
  }
};
