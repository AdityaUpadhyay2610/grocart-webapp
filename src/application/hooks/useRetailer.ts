import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retailerApi } from '../../infrastructure/api/retailerApi';
import { ProductItem } from '../../domain/models';

export const useRetailerInventory = (retailerId?: string) => {
  return useQuery({
    queryKey: ['retailer-inventory', retailerId],
    queryFn: () => (retailerId ? retailerApi.fetchMyProducts(retailerId) : Promise.resolve([])),
    enabled: !!retailerId,
    staleTime: 1000 * 60 * 3, // 3-minute freshness cache
  });
};

export const useCreateRetailerProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProduct: ProductItem) => retailerApi.createProduct(newProduct),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['retailer-inventory', variables.retailerId] });
      queryClient.invalidateQueries({ queryKey: ['retailer-analytics', variables.retailerId] });
    },
  });
};

export const useRetailerAnalytics = (retailerId?: string) => {
  return useQuery({
    queryKey: ['retailer-analytics', retailerId],
    queryFn: () => (retailerId ? retailerApi.fetchMyAnalytics(retailerId) : Promise.resolve(null)),
    enabled: !!retailerId,
    staleTime: 1000 * 60 * 1,
  });
};

