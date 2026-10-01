// src/modules/customer/services/cartRepository.js
// Cart persistence layer – now backed by Express + PostgreSQL REST API.
// Guest sessions still use localStorage for zero-auth cart storage.

import { apiClient } from '@global/utils/axiosInstance';
import { CartItem } from '@global/models/CartItem';

// ─── Helpers ────────────────────────────────────────────────────────────────

function toCartItem(raw) {
  return new CartItem({
    id: raw.id ?? raw.item_id ?? raw.product_id ?? 0,
    productId: raw.productId ?? raw.product_id ?? raw.id ?? 0,
    itemName: raw.product_name ?? raw.itemName ?? '',
    itemPrice: Number(raw.price ?? raw.itemPrice) || 0,
    itemQuantity: raw.itemQuantity ?? raw.unit ?? '500g',
    imageUrl: raw.image_url ?? raw.imageUrl ?? '',
    quantity: Number(raw.quantity) || 1,
    itemCost: Number(raw.itemCost ?? raw.cost_price) || 0,
    itemStock: Number(raw.itemStock ?? raw.stock_quantity) || 0,
    retailerId: String(raw.retailer_id ?? raw.retailerId ?? ''),
  });
}

// ─── Guest (localStorage) helpers ──────────────────────────────────────────

function guestFetch() {
  try {
    const raw = localStorage.getItem('grocart_guest_cart');
    if (!raw) return [];
    return JSON.parse(raw)
      .filter(Boolean)
      .map(toCartItem);
  } catch {
    return [];
  }
}

function guestSave(list) {
  localStorage.setItem('grocart_guest_cart', JSON.stringify(list));
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch the cart for a user. Guest users read from localStorage.
 */
export const fetchCart = async (userId) => {
  if (!userId) return [];

  if (userId === 'guest_user') return guestFetch();

  try {
    const response = await apiClient.get('/cart');
    const data = response.data?.data;
    const items = Array.isArray(data) ? data : data?.items ?? [];
    return items.map(toCartItem);
  } catch (error) {
    console.error(`Failed to fetch cart for user ${userId}:`, error);
    return [];
  }
};

/**
 * Add or update an item in the cart. Guest users write to localStorage.
 */
export const saveCartItem = async (userId, cartItem) => {
  if (!userId || !cartItem) return;

  if (userId === 'guest_user') {
    const list = guestFetch();
    const idx = list.findIndex((i) => i.id === cartItem.id);
    if (idx > -1) list[idx] = cartItem;
    else list.push(cartItem);
    guestSave(list);
    return;
  }

  try {
    await apiClient.put(`/cart/items/${cartItem.id}`, {
      productId: cartItem.productId || cartItem.id,
      itemName: cartItem.itemName,
      itemPrice: cartItem.itemPrice,
      itemCost: cartItem.itemCost || 0,
      itemQuantity: cartItem.itemQuantity || '500g',
      imageUrl: cartItem.imageUrl,
      quantity: cartItem.quantity,
      itemStock: cartItem.itemStock || 0,
      retailerId: cartItem.retailerId || '',
    });
  } catch (error) {
    console.error(`Failed to save cart item for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Remove a single item from the cart.
 */
export const removeCartItem = async (userId, itemId) => {
  if (!userId || !itemId) return;

  if (userId === 'guest_user') {
    const list = guestFetch().filter((i) => i.id !== itemId);
    guestSave(list);
    return;
  }

  try {
    await apiClient.delete(`/cart/items/${itemId}`);
  } catch (error) {
    console.error(`Failed to remove cart item ${itemId} for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Clear all items from the cart.
 */
export const clearCart = async (userId) => {
  if (!userId) return;

  if (userId === 'guest_user') {
    localStorage.removeItem('grocart_guest_cart');
    return;
  }

  try {
    await apiClient.delete('/cart');
  } catch (error) {
    console.error(`Failed to clear cart for user ${userId}:`, error);
    throw error;
  }
};
