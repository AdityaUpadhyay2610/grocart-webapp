// server/src/controllers/product.controller.js
// Handles public product catalog and retailer inventory CRUD.
// All database queries use parameterized SQL; identity is enforced from req.user.id.

const { query } = require('../config/db');
const { formatProduct } = require('../utils/formatters');
const { sendSuccess, sendError } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/products — public, returns all active products
const getProducts = asyncHandler(async (req, res) => {
  const result = await query(
    "SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC",
    []
  );
  const products = result.rows.map(formatProduct);
  return sendSuccess(res, products);
});

// GET /api/retailer/products — retailer only, returns all products owned by this retailer
const getRetailerProducts = asyncHandler(async (req, res) => {
  const retailerId = req.user.id;
  const result = await query(
    'SELECT * FROM products WHERE retailer_id = $1 ORDER BY created_at DESC',
    [retailerId]
  );
  const products = result.rows.map(formatProduct);
  return sendSuccess(res, products);
});

// PUT /api/retailer/products/:id — retailer only, creates or updates a product
const saveProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const retailerId = req.user.id; // Always enforced from token

  // 1. Check if product already exists under another retailer
  const existing = await query('SELECT id, retailer_id FROM products WHERE id = $1', [productId]);
  if (existing.rows.length > 0 && existing.rows[0].retailer_id !== retailerId) {
    return sendError(res, 'You do not have permission to modify this product.', [], 403);
  }

  // 2. Fetch the retailer store name from the database
  const userResult = await query('SELECT store_name, name FROM users WHERE id = $1', [retailerId]);
  const storeName = userResult.rows[0]?.store_name || userResult.rows[0]?.name || '';

  // 3. Extract and sanitize input fields
  const {
    title,
    description = '',
    categoryId = '',
    categoryName = '',
    costPrice,
    sellingPrice,
    stockQuantity,
    unit = 'pcs',
    unitSize = null,
    itemQuantity = '',
    imageUrl = '',
    status
  } = req.body;

  const parsedCost = Number(costPrice);
  const parsedPrice = Number(sellingPrice);
  const parsedStock = parseInt(stockQuantity, 10);
  const parsedUnitSize = unitSize !== null && unitSize !== undefined && unitSize !== '' ? Number(unitSize) : null;

  // Determine status: if not explicitly provided, auto-set based on stock
  let productStatus = status;
  if (!productStatus) {
    productStatus = parsedStock > 0 ? 'active' : 'out_of_stock';
  }

  const now = Date.now();
  const createdAt = req.body.createdAt ? Number(req.body.createdAt) : now;
  const updatedAt = now;

  // 4. Upsert product: INSERT or UPDATE on conflict
  const sql = `
    INSERT INTO products (
      id, retailer_id, retailer_store_name, title, description,
      category_id, category_name, cost_price, selling_price, stock_quantity,
      unit, unit_size, item_quantity, image_url, status, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17
    )
    ON CONFLICT (id) DO UPDATE SET
      retailer_store_name = EXCLUDED.retailer_store_name,
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      category_id = EXCLUDED.category_id,
      category_name = EXCLUDED.category_name,
      cost_price = EXCLUDED.cost_price,
      selling_price = EXCLUDED.selling_price,
      stock_quantity = EXCLUDED.stock_quantity,
      unit = EXCLUDED.unit,
      unit_size = EXCLUDED.unit_size,
      item_quantity = EXCLUDED.item_quantity,
      image_url = EXCLUDED.image_url,
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at
    WHERE products.retailer_id = $2
    RETURNING *;
  `;

  const values = [
    productId,
    retailerId,
    storeName,
    title,
    description,
    categoryId,
    categoryName,
    parsedCost,
    parsedPrice,
    parsedStock,
    unit,
    parsedUnitSize,
    itemQuantity,
    imageUrl,
    productStatus,
    createdAt,
    updatedAt
  ];

  const result = await query(sql, values);

  if (result.rows.length === 0) {
    return sendError(res, 'You do not have permission to modify this product.', [], 403);
  }

  const statusCode = existing.rows.length > 0 ? 200 : 201;
  return sendSuccess(res, formatProduct(result.rows[0]), statusCode);
});

// DELETE /api/retailer/products/:id — retailer only (or admin), deletes a product
const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const currentUserId = req.user.id;
  const currentUserRole = req.user.role;

  // 1. Check if product exists
  const existing = await query('SELECT id, retailer_id FROM products WHERE id = $1', [productId]);
  if (existing.rows.length === 0) {
    return sendError(res, 'Product not found.', [], 404);
  }

  // 2. Enforce ownership: only the owning retailer (or admin) can delete
  if (existing.rows[0].retailer_id !== currentUserId && currentUserRole !== 'admin') {
    return sendError(res, 'You do not have permission to delete this product.', [], 403);
  }

  // 3. Delete product
  await query('DELETE FROM products WHERE id = $1', [productId]);
  return sendSuccess(res, { message: 'Product deleted successfully.' });
});

module.exports = {
  getProducts,
  getRetailerProducts,
  saveProduct,
  deleteProduct
};
