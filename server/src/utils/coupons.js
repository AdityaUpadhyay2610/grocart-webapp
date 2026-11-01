async function findValidCoupon(database, code, itemTotal, lock = false) {
  const normalizedCode = String(code || '').trim().toUpperCase();
  if (!normalizedCode) {
    return { error: 'Please enter a coupon code.' };
  }

  const lockClause = lock ? ' FOR UPDATE' : '';
  const result = await database.query(
    `SELECT code, type, value, minimum_order, expires_at, max_uses, used_count
     FROM coupons
     WHERE UPPER(code) = $1
       AND active = TRUE
       AND (expires_at IS NULL OR expires_at > NOW())
       AND (max_uses IS NULL OR used_count < max_uses)
     ${lockClause}`,
    [normalizedCode]
  );
  const coupon = result.rows[0];
  if (!coupon) {
    return { error: 'Invalid or expired coupon code.' };
  }

  const minimumOrder = Number(coupon.minimum_order);
  if (itemTotal < minimumOrder) {
    return { error: `Minimum order ${minimumOrder} required.` };
  }

  const value = Number(coupon.value);
  const discount = coupon.type === 'percent'
    ? Number((itemTotal * value / 100).toFixed(2))
    : Math.min(value, itemTotal);

  return {
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value,
      minimumOrder,
      discount
    }
  };
}

async function incrementCouponUse(database, couponCode) {
  const result = await database.query(
    `UPDATE coupons
     SET used_count = used_count + 1
     WHERE UPPER(code) = $1
       AND active = TRUE
       AND (expires_at IS NULL OR expires_at > NOW())
       AND (max_uses IS NULL OR used_count < max_uses)
     RETURNING code`,
    [couponCode]
  );

  return result.rowCount === 1;
}

module.exports = {
  findValidCoupon,
  incrementCouponUse
};
