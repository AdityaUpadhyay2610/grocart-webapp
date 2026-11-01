const { query } = require('../config/db');
const { findValidCoupon } = require('../utils/coupons');
const { sendSuccess, sendError } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, items } = req.body;
  const productIds = items.map((item) => item.productId);
  const productResult = await query(
    `SELECT id, selling_price
     FROM products
     WHERE id = ANY($1::text[])
       AND status = 'active'`,
    [productIds]
  );

  const productsById = new Map(productResult.rows.map((product) => [product.id, product]));
  let itemTotal = 0;
  for (const item of items) {
    const product = productsById.get(item.productId);
    if (!product) {
      return sendError(res, 'One or more products are no longer available.', [], 400);
    }
    itemTotal += Number(product.selling_price) * item.quantity;
  }

  const result = await findValidCoupon({ query }, code, itemTotal);
  if (result.error) {
    return sendError(res, result.error, [], 400);
  }

  return sendSuccess(res, result.coupon);
});

module.exports = {
  validateCoupon
};
