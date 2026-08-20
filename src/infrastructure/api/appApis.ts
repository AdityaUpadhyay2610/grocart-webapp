import { apiClient } from '../http/axiosInstance';
import { ProductItem, ProductCategory, RetailerAnalytics, PlatformAnalytics, UserProfile, Order } from '../../domain/models';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/firebaseConfig';

export const retailerApi = {
  fetchInventory: async (retailerId: string): Promise<ProductItem[]> => {
    const res = await apiClient.get<Record<string, ProductItem>>('/products.json', {
      params: { orderBy: '"retailerId"', equalTo: `"${retailerId}"` },
    });
    return res.data ? Object.values(res.data) : [];
  },

  saveProduct: async (product: ProductItem): Promise<void> => {
    await apiClient.put(`/products/${product.id}.json`, product);
  },

  deleteProduct: async (productId: string): Promise<void> => {
    await apiClient.delete(`/products/${productId}.json`);
  },

  fetchAnalytics: async (retailerId: string): Promise<RetailerAnalytics | null> => {
    try {
      const snap = await get(ref(db, `retailer_analytics/${retailerId}`));
      if (snap.exists()) {
        return snap.val() as RetailerAnalytics;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch analytics via SDK", error);
      return null;
    }
  }
};

export const adminApi = {
  fetchAllUsers: async (): Promise<UserProfile[]> => {
    const res = await apiClient.get<Record<string, UserProfile>>('/users.json');
    return res.data ? Object.values(res.data) : [];
  },

  fetchPlatformAnalytics: async (): Promise<PlatformAnalytics | null> => {
    const res = await apiClient.get<PlatformAnalytics>('/platform_analytics.json');
    return res.data || null;
  },

  createCategory: async (category: ProductCategory): Promise<void> => {
    await apiClient.put(`/categories/${category.id}.json`, category);
  },

  deleteUser: async (userId: string, role?: string): Promise<void> => {
    // 1. Delete the core user profile
    await apiClient.delete(`/users/${userId}.json`);

    // 2. Handle role-specific cascading deletes
    if (role === 'retailer') {
      // Delete retailer analytics
      await apiClient.delete(`/retailer_analytics/${userId}.json`);
      
      // Fetch and delete all products owned by this retailer
      const productsRes = await apiClient.get<Record<string, ProductItem>>('/products.json', {
        params: { orderBy: '"retailerId"', equalTo: `"${userId}"` },
      });
      if (productsRes.data) {
        const productIds = Object.keys(productsRes.data);
        await Promise.all(productIds.map(pId => apiClient.delete(`/products/${pId}.json`)));
      }
    } else if (role === 'customer') {
      // Delete customer cart
      await apiClient.delete(`/carts/${userId}.json`);
      
      // Fetch and delete all orders owned by this customer
      const ordersRes = await apiClient.get<Record<string, Order>>('/orders.json', {
        params: { orderBy: '"customerId"', equalTo: `"${userId}"` },
      });
      if (ordersRes.data) {
        const orderIds = Object.keys(ordersRes.data);
        await Promise.all(orderIds.map(oId => apiClient.delete(`/orders/${oId}.json`)));
      }
    }
  }
};

export const storefrontApi = {
  fetchAllProducts: async (): Promise<ProductItem[]> => {
    const res = await apiClient.get<Record<string, ProductItem>>('/products.json');
    return res.data ? Object.values(res.data).filter(p => p.status === 'active') : [];
  },

  fetchCategories: async (): Promise<ProductCategory[]> => {
    const res = await apiClient.get<Record<string, ProductCategory>>('/categories.json');
    return res.data ? Object.values(res.data) : [];
  },

  placeOrder: async (order: Order): Promise<void> => {
    await apiClient.put(`/orders/${order.id}.json`, order);
  }
};
