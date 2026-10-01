// server/src/controllers/cart.controller.js
// Handles shopping cart CRUD operations for logged-in users.
// Identity always comes from req.user.id (JWT access token).

const { query } = require('../config/db');
const { formatCartItem } = require('../utils/formatters');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/cart — fetch current user's cart items
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await query(
    'SELECT * FROM cart_items WHERE user_id = $1 ORDER BY item_id ASC',
    [userId]
  );
  const items = result.rows.map(formatCartItem);
  return sendSuccess(res, items);
});

// PUT /api/cart/items/:itemId — add or update item in cart (upsert)
const saveCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.itemId;

  const {
    productId = '',
    itemName = '',
    itemPrice = 0,
    itemCost = 0,
    itemQuantity = '500g',
    imageUrl = '',
    quantity = 1,
    itemStock = 0,
    retailerId = ''
  } = req.body;

  // If productId was not passed, check if itemId starts with prod_ or matches
  const resolvedProductId = productId || itemId;

  const sql = `
    INSERT INTO cart_items (
      user_id, item_id, product_id, item_name, item_price,
      item_cost, item_quantity, image_url, quantity, item_stock, retailer_id
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10, $11
    )
    ON CONFLICT (user_id, item_id) DO UPDATE SET
      product_id = EXCLUDED.product_id,
      item_name = EXCLUDED.item_name,
      item_price = EXCLUDED.item_price,
      item_cost = EXCLUDED.item_cost,
      item_quantity = EXCLUDED.item_quantity,
      image_url = EXCLUDED.image_url,
      quantity = EXCLUDED.quantity,
      item_stock = EXCLUDED.item_stock,
      retailer_id = EXCLUDED.retailer_id
    RETURNING *;
  `;

  const values = [
    userId,
    itemId,
    resolvedProductId,
    itemName,
    Number(itemPrice),
    Number(itemCost),
    itemQuantity,
    imageUrl,
    parseInt(quantity, 10),
    parseInt(itemStock, 10),
    retailerId
  ];

  const result = await query(sql, values);
  return sendSuccess(res, formatCartItem(result.rows[0]), 200);
});

// DELETE /api/cart/items/:itemId — remove a single item from the cart
const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.itemId;

  await query('DELETE FROM cart_items WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
  return sendSuccess(res, { message: 'Item removed from cart.' });
});

// DELETE /api/cart — clear the entire cart for this user
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
  return sendSuccess(res, { message: 'Cart cleared.' });
});

module.exports = {
  getCart,
  saveCartItem,
  removeCartItem,
  clearCart
};
