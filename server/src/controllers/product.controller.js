const { query } = require('../config/db');
const { formatProduct, formatOwnerProduct } = require('../utils/formatters');
const { sendSuccess, sendError } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const getPagination = require('../utils/pagination');

// In-memory cache for public catalog queries (30s TTL)
const catalogCache = new Map();
const CATALOG_CACHE_TTL = 30 * 1000;

function clearCatalogCache() {
  catalogCache.clear();
}


// GET /api/products — public, returns all active products
const getProducts = asyncHandler(async (req, res) => {
  const { limit, offset } = getPagination(req.query);
  const category = req.query.category ? String(req.query.category).trim() : null;
  const cacheKey = `${category || 'all'}_${limit}_${offset}`;
  const now = Date.now();
  const cached = catalogCache.get(cacheKey);

  if (cached && now < cached.expiresAt) {
    return sendSuccess(res, cached.data);
  }

  let sql;
  let params;
  if (category) {
    sql = `SELECT * FROM products
     WHERE status = 'active'
       AND (category_id = $1 OR category_name ILIKE $2)
     ORDER BY created_at DESC
     LIMIT $3 OFFSET $4`;
    params = [category, `%${category}%`, limit, offset];
  } else {
    sql = `SELECT * FROM products
     WHERE status = 'active'
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`;
    params = [limit, offset];
  }

  const result = await query(sql, params);
  const products = result.rows.map(formatProduct);
  catalogCache.set(cacheKey, { data: products, expiresAt: now + CATALOG_CACHE_TTL });
  return sendSuccess(res, products);
});

// GET /api/retailer/products — retailer only, returns all products owned by this retailer
const getRetailerProducts = asyncHandler(async (req, res) => {
  const retailerId = req.user.id;
  const result = await query(
    'SELECT * FROM products WHERE retailer_id = $1 ORDER BY created_at DESC',
    [retailerId]
  );
  const products = result.rows.map(formatOwnerProduct);
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

  clearCatalogCache();
  const statusCode = existing.rows.length > 0 ? 200 : 201;
  return sendSuccess(res, formatOwnerProduct(result.rows[0]), statusCode);
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
  clearCatalogCache();
  return sendSuccess(res, { message: 'Product deleted successfully.' });
});


// POST /api/retailer/products/bulk — retailer only, bulk upsert products
const bulkSaveProducts = asyncHandler(async (req, res) => {
  const retailerId = req.user.id;
  const storeName = req.user.storeName || req.user.name;
  const products = req.body.products || [];

  if (!Array.isArray(products) || products.length === 0) {
    return sendError(res, 'products array is required and must not be empty.', [], 400);
  }

  const saved = [];
  for (const item of products) {
    const productId = item.id;
    const {
      title,
      description = '',
      categoryId,
      categoryName,
      costPrice = 0,
      sellingPrice = 0,
      stockQuantity = 0,
      unit = 'pcs',
      unitSize = null,
      itemQuantity = '',
      imageUrl = '',
      status
    } = item;

    const parsedCost = Number(costPrice) || 0;
    const parsedPrice = Number(sellingPrice) || 0;
    const parsedStock = Math.floor(Number(stockQuantity) || 0);
    const parsedUnitSize = unitSize !== null && unitSize !== undefined && unitSize !== '' ? Number(unitSize) : null;
    let productStatus = status || (parsedStock > 0 ? 'active' : 'out_of_stock');
    const now = Date.now();
    const createdAt = item.createdAt ? Number(item.createdAt) : now;
    const updatedAt = now;

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
    if (result.rows.length > 0) {
      saved.push(formatOwnerProduct(result.rows[0]));
    }
  }

  clearCatalogCache();
  return sendSuccess(res, { count: saved.length, products: saved }, 200);
});

// POST /api/retailer/products/bulk-delete — retailer only, bulk delete products
const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const retailerId = req.user.id;
  const productIds = req.body.productIds;

  if (Array.isArray(productIds) && productIds.length > 0) {
    await query('DELETE FROM products WHERE retailer_id = $1 AND id = ANY($2::text[])', [retailerId, productIds]);
  } else {
    // Delete all products for this retailer
    await query('DELETE FROM products WHERE retailer_id = $1', [retailerId]);
  }

  clearCatalogCache();
  return sendSuccess(res, { message: 'Products deleted successfully.' });
});

module.exports = {
  bulkSaveProducts,
  bulkDeleteProducts,
  getProducts,
  getRetailerProducts,
  saveProduct,
  deleteProduct
};
