import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retailerApi } from '@global/services/api/appApis';
import { ProductItem } from '@global/models';

export const useRetailerOperations = (user: any) => {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['retailer-products', user?.uid],
    queryFn: () => (user?.uid ? retailerApi.fetchInventory(user.uid) : Promise.resolve([])),
    enabled: !!user?.uid,
  });

  const { data: stats } = useQuery({
    queryKey: ['retailer-stats', user?.uid],
    queryFn: () => (user?.uid ? retailerApi.fetchAnalytics(user.uid) : Promise.resolve(null)),
    enabled: !!user?.uid,
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['retailer-orders', user?.uid],
    queryFn: () => (user?.uid ? retailerApi.fetchRetailerOrders(user.uid) : Promise.resolve([])),
    enabled: !!user?.uid,
    refetchInterval: 15000,
  });

  const createMutation = useMutation({
    mutationFn: (newProduct: ProductItem) => retailerApi.saveProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailer-products', user?.uid] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => retailerApi.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailer-products', user?.uid] });
    },
  });

  return {
    products,
    isLoadingProducts,
    stats,
    orders,
    isLoadingOrders,
    createMutation,
    deleteMutation
  };
};
