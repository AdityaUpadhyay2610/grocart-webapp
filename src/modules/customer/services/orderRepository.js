// src/modules/customer/services/orderRepository.js
// Order persistence layer backed by Express + PostgreSQL REST API and Razorpay.

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
    paymentMethod: raw.paymentMethod ?? raw.payment_method ?? 'COD',
    paymentStatus: raw.paymentStatus ?? raw.payment_status ?? 'pending',
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch all orders for a customer.
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
 * Place a standard Cash on Delivery (COD) order.
 */
export const placeOrder = async (userId, order) => {
  if (!userId || !order) return null;

  try {
    const payload = {
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId || item.id,
        quantity: item.quantity,
      })),
      couponCode: order.couponCode,
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
 * Initializes a Razorpay order on the backend.
 * @param {{ items: Array, couponCode?: string }} orderPayload
 */
export const createRazorpayOrder = async (orderPayload) => {
  try {
    const payload = {
      items: orderPayload.items.map((item) => ({
        id: item.id,
        productId: item.productId || item.id,
        quantity: item.quantity,
      })),
      couponCode: orderPayload.couponCode,
    };

    const response = await apiClient.post('/orders/razorpay/create-order', payload);
    return response.data?.data;
  } catch (error) {
    console.error('Failed to create Razorpay order:', error);
    throw error;
  }
};

/**
 * Verifies Razorpay payment signature and commits the order.
 * @param {Object} verificationData
 */
export const verifyRazorpayPayment = async (verificationData) => {
  try {
    const response = await apiClient.post('/orders/razorpay/verify', verificationData);
    const data = response.data?.data;
    return data?.orderId ?? data?.id;
  } catch (error) {
    console.error('Failed to verify Razorpay payment:', error);
    throw error;
  }
};

/**
 * Update order status (Admin / Retailer).
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