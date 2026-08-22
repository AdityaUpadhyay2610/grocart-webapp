import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, storefrontApi } from '@global/services/api/appApis';

export const useAdminData = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: adminApi.fetchAllUsers,
  });

  const deleteUserMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role?: string }) => adminApi.deleteUser(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-products'] });
    }
  });

  const handleDeleteUser = (userId: string, role?: string) => {
    if (window.confirm('Are you sure you want to permanently delete this user and their data?')) {
      deleteUserMutation.mutate({ userId, role });
    }
  };

  const { data: platformStats } = useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: adminApi.fetchPlatformAnalytics,
  });

  const { data: allProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['admin-all-products'],
    queryFn: storefrontApi.fetchAllProducts,
  });

  // Derived Data
  const retailers = users.filter((u: any) => u.role === 'retailer');
  const customers = users.filter((u: any) => u.role === 'customer' || !u.role);
  
  const validUserIds = new Set(users.map((u: any) => u.uid));
  const validProducts = allProducts.filter((p: any) => validUserIds.has(p.retailerId));
  const orphanedProducts = allProducts.filter((p: any) => !validUserIds.has(p.retailerId));

  const totalCatalogValue = validProducts.reduce((sum: number, p: any) => sum + (p.sellingPrice * p.stockQuantity), 0);
  const totalCatalogCost = validProducts.reduce((sum: number, p: any) => sum + (p.costPrice * p.stockQuantity), 0);
  const potentialProfit = totalCatalogValue - totalCatalogCost;

  return {
    users,
    usersLoading,
    deleteUserMutation,
    handleDeleteUser,
    platformStats,
    allProducts,
    productsLoading,
    retailers,
    customers,
    validProducts,
    orphanedProducts,
    totalCatalogValue,
    totalCatalogCost,
    potentialProfit
  };
};
