import { apiClient } from '@global/utils/axiosInstance';
import { ProductItem, ProductCategory, RetailerAnalytics, PlatformAnalytics, UserProfile, Order } from '@global/models';
import { ref, get, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database as db } from '@global/config/firebaseConfig';

export const retailerApi = {
  fetchInventory: async (retailerId: string): Promise<ProductItem[]> => {
    try {
      const q = query(ref(db, 'products'), orderByChild('retailerId'), equalTo(retailerId));
      const snap = await get(q);
      if (snap.exists()) {
        return Object.values(snap.val() as Record<string, ProductItem>);
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch inventory", error);
      return [];
    }
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
  },

  fetchRetailerOrders: async (retailerId: string): Promise<(Order & { customerDetails?: UserProfile })[]> => {
    try {
      const snapshot = await get(ref(db, 'orders'));
      if (!snapshot.exists()) return [];
      
      const rawData = snapshot.val();
      const allOrders = Object.entries(rawData).map(([id, order]: [string, any]) => ({
        ...order,
        id,
        items: Array.isArray(order.items) 
          ? order.items 
          : (typeof order.items === 'object' ? Object.values(order.items || {}) : [])
      })) as Order[];

      // Fetch products owned by this retailer to match old order items without retailerId
      const retailerProducts = await retailerApi.fetchInventory(retailerId);
      const retailerProductIds = new Set(retailerProducts.map(p => p.id));

      const retailerOrders = allOrders.filter(order => {
        const items = Array.isArray(order.items) ? order.items : (Object.values(order.items || {}) as any[]);
        
        // Backwards compatibility: retroactively assign retailerId if it matches inventory
        items.forEach(item => {
          if (!item.retailerId && retailerProductIds.has(item.id)) {
            item.retailerId = retailerId;
          }
        });

        return items.some(item => item.retailerId === retailerId);
      });

      const customerIds = [...new Set(retailerOrders.map(o => o.customerId).filter(Boolean))];
      const customerProfiles: Record<string, UserProfile> = {};

      await Promise.all(customerIds.map(async (uid) => {
        try {
          const userSnap = await get(ref(db, `users/${uid}`));
          if (userSnap.exists()) {
            customerProfiles[uid] = userSnap.val() as UserProfile;
          }
        } catch (e) {
          console.error("Failed to fetch user profile for", uid, e);
        }
      }));

      return retailerOrders.map(order => ({
        ...order,
        customerDetails: customerProfiles[order.customerId]
      })).sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error("Failed to fetch retailer orders", error);
      return [];
    }
  }
};

export const adminApi = {
  fetchAllUsers: async (): Promise<UserProfile[]> => {
    const snap = await get(ref(db, 'users'));
    return snap.exists() ? Object.values(snap.val() as Record<string, UserProfile>) : [];
  },

  fetchAllOrders: async (): Promise<Order[]> => {
    const snap = await get(ref(db, 'orders'));
    if (!snap.exists()) return [];
    
    const rawData = snap.val();
    return Object.entries(rawData).map(([id, order]: [string, any]) => ({
      ...order,
      id,
      items: Array.isArray(order.items) 
        ? order.items 
        : (typeof order.items === 'object' ? Object.values(order.items || {}) : [])
    })) as Order[];
  },

  fetchPlatformAnalytics: async (): Promise<PlatformAnalytics | null> => {
    const snap = await get(ref(db, 'platform_analytics'));
    return snap.exists() ? (snap.val() as PlatformAnalytics) : null;
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

  subscribeToProducts: (onData: (products: ProductItem[]) => void) => {
    const productsRef = ref(db, 'products');
    return onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const products = Object.values(data) as ProductItem[];
        onData(products.filter(p => p.status === 'active'));
      } else {
        onData([]);
      }
    });
  },

  fetchCategories: async (): Promise<ProductCategory[]> => {
    const res = await apiClient.get<any>('/categories.json');
    if (!res.data) return [];
    const normalizedCategories: ProductCategory[] = [];
    Object.entries(res.data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        normalizedCategories.push({ id: value.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: value });
      } else if (typeof value === 'object' && value !== null) {
        normalizedCategories.push(value as ProductCategory);
      }
    });
    return normalizedCategories;
  },

  subscribeToCategories: (onData: (categories: ProductCategory[]) => void) => {
    const categoriesRef = ref(db, 'categories');
    return onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const normalizedCategories: ProductCategory[] = [];
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === 'string') {
            normalizedCategories.push({ id: value.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: value });
          } else if (typeof value === 'object' && value !== null) {
            normalizedCategories.push(value as ProductCategory);
          }
        });
        onData(normalizedCategories);
      } else {
        onData([]);
      }
    });
  },

  placeOrder: async (order: Order): Promise<void> => {
    await apiClient.put(`/orders/${order.id}.json`, order);
  }
};
