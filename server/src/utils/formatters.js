// server/src/utils/formatters.js
// Converts raw PostgreSQL rows into the exact JSON shapes the frontend expects.
//
// IMPORTANT: pg returns NUMERIC and BIGINT columns as strings.
// Every numeric field must be wrapped with Number() to prevent NaN bugs in the UI.

/**
 * Format a user row from the DB.
 * NEVER include password_hash or sensitive fields.
 * Returns camelCase keys matching what the frontend expects.
 */
function formatUser(row) {
  return {
    uid: row.id,
    name: row.name || '',
    email: row.email || '',
    role: row.role || 'customer',
    storeName: row.store_name || '',
    phoneNumber: row.phone_number || '',
    address: row.address || '',
    avatarStyle: row.avatar_style || '',
    avatarSeed: row.avatar_seed || '',
    avatarUrl: row.avatar_url || '',
    createdAt: Number(row.created_at),
    emailVerified: row.email_verified
  };
}

/**
 * Format a product row from the DB.
 */
function formatProduct(row) {
  return {
    id: row.id,
    retailerId: row.retailer_id,
    retailerStoreName: row.retailer_store_name || '',
    title: row.title,
    description: row.description || '',
    categoryId: row.category_id || '',
    categoryName: row.category_name || '',
    costPrice: Number(row.cost_price),
    sellingPrice: Number(row.selling_price),
    stockQuantity: Number(row.stock_quantity),
    unit: row.unit || 'pcs',
    unitSize: row.unit_size !== null ? Number(row.unit_size) : null,
    itemQuantity: row.item_quantity || '',
    imageUrl: row.image_url || '',
    status: row.status,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  };
}

/**
 * Format a category row from the DB.
 */
function formatCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || '',
    isActive: row.is_active,
    description: row.description || '',
    image: row.image || ''
  };
}

/**
 * Format a cart item row from the DB.
 * Note: item_id is returned as "id" because the frontend uses that field name.
 */
function formatCartItem(row) {
  return {
    id: row.item_id,
    productId: row.product_id || '',
    itemName: row.item_name || '',
    itemPrice: Number(row.item_price),
    itemCost: Number(row.item_cost),
    itemQuantity: row.item_quantity || '',
    imageUrl: row.image_url || '',
    quantity: Number(row.quantity),
    itemStock: Number(row.item_stock),
    retailerId: row.retailer_id || ''
  };
}

/**
 * Format an order row with its items array.
 * Sends BOTH old and new field names because different screens in the UI use different keys.
 * @param {object} row - order row from DB
 * @param {Array} items - array of order_item rows
 * @param {object|null} customerUser - optional user row for retailer order view
 */
function formatOrder(row, items = [], customerUser = null) {
  const timestamp = Number(row.created_at);
  const totalPaid = Number(row.total_paid);

  const formattedItems = items.map((item) => ({
    id: item.item_id,
    productId: item.product_id || '',
    itemName: item.item_name || '',
    title: item.item_name || '',            // alias used in some screens
    itemPrice: Number(item.item_price),
    unitPrice: Number(item.item_price),     // alias
    itemCost: Number(item.item_cost),
    costPrice: Number(item.item_cost),      // alias
    itemQuantity: item.item_quantity || '',
    imageUrl: item.image_url || '',
    quantity: Number(item.quantity),
    retailerId: item.retailer_id || ''
  }));

  const result = {
    id: row.id,
    customerId: row.customer_id,
    customerEmail: row.customer_email || '',
    timestamp,
    createdAt: timestamp,                   // same value, two names
    totalPaid,
    totalAmount: totalPaid,                 // same value, two names
    couponDiscount: Number(row.coupon_discount),
    status: row.status,
    items: formattedItems
  };

  // Add customerDetails only when fetching orders for a retailer
  if (customerUser) {
    result.customerDetails = formatUser(customerUser);
  }

  return result;
}

/**
 * Format a retailer analytics row.
 */
function formatRetailerAnalytics(row) {
  return {
    retailerId: row.retailer_id,
    totalRevenue: Number(row.total_revenue),
    totalCost: Number(row.total_cost),
    grossProfit: Number(row.gross_profit),
    totalOrdersFulfilled: Number(row.total_orders_fulfilled),
    lastUpdated: Number(row.last_updated)
  };
}

/**
 * Format the platform analytics row (always one row).
 * totalRetailers is computed separately and passed in.
 */
function formatPlatformAnalytics(row, totalRetailers) {
  return {
    totalGMV: Number(row.total_gmv),
    totalPlatformProfit: Number(row.total_platform_profit),
    totalOrders: Number(row.total_orders),
    totalRetailers: Number(totalRetailers)
  };
}

module.exports = {
  formatUser,
  formatProduct,
  formatCategory,
  formatCartItem,
  formatOrder,
  formatRetailerAnalytics,
  formatPlatformAnalytics
};
