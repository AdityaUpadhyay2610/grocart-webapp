// src/global/services/api/appApis.ts
// Retailer, Admin, and Storefront APIs — all backed by the Express + PostgreSQL REST backend.
// subscribeToProducts / subscribeToCategories use 10-second polling for live updates.

import { apiClient } from '@global/utils/axiosInstance';
import {
  ProductItem,
  ProductCategory,
  RetailerAnalytics,
  PlatformAnalytics,
  UserProfile,
  Order
} from '@global/models';
import { DEFAULT_CATEGORIES } from '@global/utils/constants';

// ─── Retailer API ────────────────────────────────────────────────────────────

export const retailerApi = {
  /** Fetch all products owned by this retailer (all statuses). */
  fetchInventory: async (_retailerId: string): Promise<ProductItem[]> => {
    try {
      const res = await apiClient.get('/retailer/products');
      const data = res.data?.data;
      return (Array.isArray(data) ? data : data?.products ?? []) as ProductItem[];
    } catch (error) {
      console.error('Failed to fetch inventory', error);
      return [];
    }
  },

  /** Create or update a product (upsert). Retailer id comes from the token on the server. */
  saveProduct: async (product: ProductItem): Promise<void> => {
    await apiClient.put(`/retailer/products/${product.id}`, product);
  },

  /** Delete a product. Only the owner can do this. */
  deleteProduct: async (productId: string): Promise<void> => {
    await apiClient.delete(`/retailer/products/${productId}`);
  },

  /** Fetch retailer's own analytics. Returns null if no analytics row yet. */
  fetchAnalytics: async (_retailerId: string): Promise<RetailerAnalytics | null> => {
    try {
      const res = await apiClient.get('/retailer/analytics');
      return (res.data?.data?.analytics ?? null) as RetailerAnalytics | null;
    } catch (error) {
      console.error('Failed to fetch analytics', error);
      return null;
    }
  },

  /** Fetch all orders that contain this retailer's products (with customerDetails). */
  fetchRetailerOrders: async (_retailerId: string): Promise<(Order & { customerDetails?: UserProfile })[]> => {
    try {
      const res = await apiClient.get('/retailer/orders');
      return (res.data?.data?.orders ?? []) as (Order & { customerDetails?: UserProfile })[];
    } catch (error) {
      console.error('Failed to fetch retailer orders', error);
      return [];
    }
  }
};

// ─── Admin API ───────────────────────────────────────────────────────────────

export const adminApi = {
  /** Fetch all users on the platform. */
  fetchAllUsers: async (): Promise<UserProfile[]> => {
    try {
      const res = await apiClient.get('/admin/users');
      return (res.data?.data?.users ?? []) as UserProfile[];
    } catch (error) {
      console.error('Failed to fetch all users', error);
      return [];
    }
  },

  /** Fetch all orders on the platform. */
  fetchAllOrders: async (): Promise<Order[]> => {
    try {
      const res = await apiClient.get('/admin/orders');
      return (res.data?.data?.orders ?? []) as Order[];
    } catch (error) {
      console.error('Failed to fetch all orders', error);
      return [];
    }
  },

  /** Fetch platform-wide analytics (GMV, orders, retailer count). */
  fetchPlatformAnalytics: async (): Promise<PlatformAnalytics | null> => {
    try {
      const res = await apiClient.get('/admin/platform-analytics');
      return (res.data?.data?.analytics ?? null) as PlatformAnalytics | null;
    } catch (error) {
      console.error('Failed to fetch platform analytics', error);
      return null;
    }
  },

  /** Create or update a category. */
  createCategory: async (category: ProductCategory): Promise<void> => {
    await apiClient.post('/admin/categories', category);
  },

  /**
   * Delete a user by id. ON DELETE CASCADE handles all their data.
   * The `role` param is kept for API compat but the server handles cascades.
   */
  deleteUser: async (userId: string, _role?: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  }
};

// ─── Storefront API ──────────────────────────────────────────────────────────

export const storefrontApi = {
  /** Fetch all active products once. */
  fetchAllProducts: async (): Promise<ProductItem[]> => {
    try {
      const res = await apiClient.get('/products');
      const data = res.data?.data;
      return (Array.isArray(data) ? data : data?.products ?? []) as ProductItem[];
    } catch (error) {
      console.error('Failed to fetch products', error);
      return [];
    }
  },

  /**
   * Subscribe to live product updates using 10-second polling.
   * Provides live updates using 10-second polling. Returns an unsubscribe function.
   */
  subscribeToProducts: (onData: (products: ProductItem[]) => void): (() => void) => {
    // Fetch immediately on subscribe
    storefrontApi.fetchAllProducts().then(onData).catch(() => onData([]));

    // Then poll every 10 seconds
    const interval = setInterval(() => {
      storefrontApi.fetchAllProducts().then(onData).catch(() => onData([]));
    }, 10_000);

    // Return unsubscribe (clears interval)
    return () => clearInterval(interval);
  },

  /** Fetch all active categories once. */
  fetchCategories: async (): Promise<ProductCategory[]> => {
    try {
      const res = await apiClient.get('/categories');
      const cats = res.data?.data?.categories;
      if (Array.isArray(cats) && cats.length > 0) {
        return cats as ProductCategory[];
      }
      return DEFAULT_CATEGORIES as ProductCategory[];
    } catch (error) {
      console.warn('Failed to fetch categories, using default categories', error);
      return DEFAULT_CATEGORIES as ProductCategory[];
    }
  },

  /**
   * Subscribe to live category updates using 10-second polling.
   * Provides live updates using 10-second polling. Returns an unsubscribe function.
   */
  subscribeToCategories: (onData: (categories: ProductCategory[]) => void): (() => void) => {
    // Fetch immediately on subscribe
    storefrontApi.fetchCategories().then(onData).catch(() => onData([]));

    // Then poll every 10 seconds
    const interval = setInterval(() => {
      storefrontApi.fetchCategories().then(onData).catch(() => onData([]));
    }, 10_000);

    // Return unsubscribe (clears interval)
    return () => clearInterval(interval);
  },

  /** Legacy method kept for compat — not used by the new backend. */
  placeOrder: async (_order: Order): Promise<void> => {
    console.warn('[storefrontApi] placeOrder is deprecated. Use orderRepository.placeOrder instead.');
  }
};
