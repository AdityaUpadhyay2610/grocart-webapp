import { apiClient } from '../http/axiosInstance';
import { ProductItem, RetailerAnalytics } from '../../domain/models';

export const retailerApi = {
  // Fetch products belonging to specific retailer
  fetchMyProducts: async (retailerId: string): Promise<ProductItem[]> => {
    const res = await apiClient.get<Record<string, ProductItem>>('/products.json', {
      params: {
        orderBy: '"retailerId"',
        equalTo: `"${retailerId}"`,
      },
    });
    return res.data ? Object.values(res.data) : [];
  },

  // Save new product record
  createProduct: async (product: ProductItem): Promise<void> => {
    await apiClient.put(`/products/${product.id}.json`, product);
  },

  // Fetch isolated financial stats
  fetchMyAnalytics: async (retailerId: string): Promise<RetailerAnalytics | null> => {
    const res = await apiClient.get<RetailerAnalytics>(`/retailer_analytics/${retailerId}.json`);
    return res.data || null;
  }
};
