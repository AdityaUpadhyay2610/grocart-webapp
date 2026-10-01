// src/modules/customer/services/orderRepository.js
// Order persistence layer – now backed by Express + PostgreSQL REST API.
// All stock deduction, analytics, and ACID transactions happen server-side.

import { apiClient } from '@global/utils/axiosInstance';
import { Order } from '@global/models/Order';
import { CartItem } from '@global/models/CartItem';

// ─── Helpers ────────────────────────────────────────────────────────────────

function toCartItem(raw) {
  return new CartItem({
    id: raw.id ?? raw.item_id ?? raw.product_id ?? 0,
    productId: raw.productId ?? raw.product_id ?? raw.id ?? 0,
    itemName: raw.product_name ?? raw.itemName ?? raw.title ?? '',
    itemPrice: Number(raw.price ?? raw.itemPrice ?? raw.item_price) || 0,
    itemCost: Number(raw.cost_price ?? raw.itemCost ?? raw.item_cost) || 0,
    itemQuantity: raw.unit ?? raw.itemQuantity ?? raw.item_quantity ?? '500g',
    imageUrl: raw.image_url ?? raw.imageUrl ?? '',
    quantity: Number(raw.quantity) || 1,
    retailerId: String(raw.retailer_id ?? raw.retailerId ?? ''),
  });
}

function toOrder(raw) {
  const items = (raw.items ?? []).map(toCartItem);
  return new Order({
    id: raw.id ?? raw.order_id,
    items,
    timestamp: raw.created_at
      ? new Date(raw.created_at).getTime()
      : Number(raw.timestamp) || Date.now(),
    totalPaid: Number(raw.total_amount ?? raw.totalPaid) || 0,
    couponDiscount: Number(raw.couponDiscount ?? raw.discount_amount) || 0,
    status: raw.status ?? 'placed',
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch all orders for a user.
 */
export const fetchOrders = async (userId) => {
  if (!userId) return [];

  try {
    const response = await apiClient.get('/orders/my');
    const data = response.data?.data;
    const orders = Array.isArray(data) ? data : data?.orders ?? [];
    return orders.map(toOrder);
  } catch (error) {
    console.error(`Failed to fetch orders for user ${userId}:`, error);
    return [];
  }
};

/**
 * Place a new order.
 * The backend handles stock deduction, analytics, and ACID transactions.
 * Returns the new order ID string, or null on failure.
 *
 * @param {string} userId
 * @param {{ items: CartItem[], totalPaid: number, couponDiscount: number }} order
 * @returns {Promise<string|null>}
 */
export const placeOrder = async (userId, order) => {
  if (!userId || !order) return null;

  try {
    const payload = {
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId || item.id,
        quantity: item.quantity,
        itemPrice: item.itemPrice,
        itemCost: item.itemCost,
        itemName: item.itemName,
        itemQuantity: item.itemQuantity,
        imageUrl: item.imageUrl,
      })),
      totalPaid: order.totalPaid,
      couponDiscount: order.couponDiscount ?? 0,
    };

    const response = await apiClient.post('/orders', payload);
    const newOrder = response.data?.data;
    const newOrderId = newOrder?.orderId ?? newOrder?.id ?? newOrder?.order?.id;
    return newOrderId ? String(newOrderId) : null;
  } catch (error) {
    console.error(`Failed to place order for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Update the status of an existing order (admin / retailer use).
 * Cancellation / return stock reversal is handled server-side.
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  if (!orderId) return;

  try {
    await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
  } catch (error) {
    console.error(`Failed to update order ${orderId} to ${newStatus}:`, error);
    throw error;
  }
};
